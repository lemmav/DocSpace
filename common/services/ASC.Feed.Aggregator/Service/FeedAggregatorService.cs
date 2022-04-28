﻿// (c) Copyright Ascensio System SIA 2010-2022
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

namespace ASC.Feed.Aggregator.Service;

[Singletone]
public class FeedAggregatorService : FeedBaseService
{
    protected override string LoggerName { get; set; } = "ASC.Feed.Aggregator";

    private readonly SignalrServiceClient _signalrServiceClient;

    public FeedAggregatorService(
        FeedSettings feedSettings,
        IServiceScopeFactory serviceScopeFactory,
        IOptionsMonitor<ILog> optionsMonitor,
        SignalrServiceClient signalrServiceClient)
        : base(feedSettings, serviceScopeFactory, optionsMonitor)
    {
        _signalrServiceClient = signalrServiceClient;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.Info("Feed Aggregator service running.");

        var cfg = _feedSettings;

        while (!stoppingToken.IsCancellationRequested)
        {
            AggregateFeeds(cfg.AggregateInterval);

            await Task.Delay(cfg.AggregatePeriod, stoppingToken);
        }

        _logger.Info("Feed Aggregator Service stopping.");
    }

    private static T Attempt<T>(int count, Func<T> action)
    {
        var counter = 0;
        while (true)
        {
            try
            {
                return action();
            }
            catch
            {
                if (count < ++counter)
                {
                    throw;
                }
            }
        }
    }

    private static bool TryAuthenticate(SecurityContext securityContext, AuthManager authManager, int tenantId, Guid userid)
    {
        try
        {
            securityContext.AuthenticateMeWithoutCookie(authManager.GetAccountByID(tenantId, userid));
            return true;
        }
        catch
        {
            return false;
        }
    }

    private void AggregateFeeds(object interval)
    {
        try
        {
            var cfg = _feedSettings;
            using var scope = _serviceScopeFactory.CreateScope();
            var cache = scope.ServiceProvider.GetService<ICache>();
            var baseCommonLinkUtility = scope.ServiceProvider.GetService<BaseCommonLinkUtility>();
            baseCommonLinkUtility.Initialize(cfg.ServerRoot);

            var start = DateTime.UtcNow;
            _logger.DebugFormat("Start of collecting feeds...");

            var unreadUsers = new Dictionary<int, Dictionary<Guid, int>>();
            var modules = scope.ServiceProvider.GetService<IEnumerable<IFeedModule>>();

            var feedAggregateDataProvider = scope.ServiceProvider.GetService<FeedAggregateDataProvider>();
            var tenantManager = scope.ServiceProvider.GetService<TenantManager>();
            var userManager = scope.ServiceProvider.GetService<UserManager>();
            var authManager = scope.ServiceProvider.GetService<AuthManager>();
            var securityContext = scope.ServiceProvider.GetService<SecurityContext>();

            foreach (var module in modules)
            {
                var result = new List<FeedRow>();
                var fromTime = feedAggregateDataProvider.GetLastTimeAggregate(module.GetType().Name);
                if (fromTime == default)
                {
                    fromTime = DateTime.UtcNow.Subtract((TimeSpan)interval);
                }

                var toTime = DateTime.UtcNow;

                var tenants = Attempt(10, () => module.GetTenantsWithFeeds(fromTime)).ToList();
                _logger.DebugFormat("Find {1} tenants for module {0}.", module.GetType().Name, tenants.Count);

                foreach (var tenant in tenants)
                {
                    // Warning! There is hack here!
                    // clearing the cache to get the correct acl
                    cache.Remove("acl" + tenant);
                    cache.Remove("/webitemsecurity/" + tenant);
                    //cache.Remove(string.Format("sub/{0}/{1}/{2}", tenant, "6045b68c-2c2e-42db-9e53-c272e814c4ad", NotifyConstants.Event_NewCommentForMessage.ID));

                    try
                    {
                        if (tenantManager.GetTenant(tenant) == null)
                        {
                            continue;
                        }

                        tenantManager.SetCurrentTenant(tenant);
                        var users = userManager.GetUsers();

                        var feeds = Attempt(10, () => module.GetFeeds(new FeedFilter(fromTime, toTime) { Tenant = tenant }).Where(r => r.Item1 != null).ToList());
                        _logger.DebugFormat("{0} feeds in {1} tenant.", feeds.Count, tenant);

                        var tenant1 = tenant;
                        var module1 = module;
                        var feedsRow = feeds
                            .Select(tuple => new Tuple<FeedRow, object>(new FeedRow(tuple.Item1)
                            {
                                Tenant = tenant1,
                                Product = module1.Product
                            }, tuple.Item2))
                            .ToList();

                        foreach (var u in users)
                        {
                            if (!TryAuthenticate(securityContext, authManager, tenant1, u.Id))
                            {
                                continue;
                            }

                            module.VisibleFor(feedsRow, u.Id);
                        }

                        result.AddRange(feedsRow.Select(r => r.Item1));
                    }
                    catch (Exception ex)
                    {
                        _logger.ErrorFormat("Tenant: {0}, {1}", tenant, ex);
                    }
                }

                feedAggregateDataProvider.SaveFeeds(result, module.GetType().Name, toTime);

                foreach (var res in result)
                {
                    foreach (var userGuid in res.Users.Where(userGuid => !userGuid.Equals(res.ModifiedBy)))
                    {
                        if (!unreadUsers.TryGetValue(res.Tenant, out var dictionary))
                        {
                            dictionary = new Dictionary<Guid, int>();
                        }
                        if (dictionary.ContainsKey(userGuid))
                        {
                            ++dictionary[userGuid];
                        }
                        else
                        {
                            dictionary.Add(userGuid, 1);
                        }

                        unreadUsers[res.Tenant] = dictionary;
                    }
                }
            }

            _signalrServiceClient.SendUnreadUsers(unreadUsers);

            _logger.DebugFormat("Time of collecting news: {0}", DateTime.UtcNow - start);
        }
        catch (Exception ex)
        {
            _logger.Error(ex);
        }
    }
}