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

namespace ASC.Web.Api.Controllers.Settings;

public class VersionController : BaseSettingsController
{
    private Tenant Tenant { get { return ApiContext.Tenant; } }

    private readonly TenantManager _tenantManager;
    private readonly PermissionContext _permissionContext;
    private readonly BuildVersion _buildVersion;

    public VersionController(
        PermissionContext permissionContext,
        ApiContext apiContext,
        TenantManager tenantManager,
        WebItemManager webItemManager,
        BuildVersion buildVersion,
        IMemoryCache memoryCache,
        IHttpContextAccessor httpContextAccessor) : base(apiContext, memoryCache, webItemManager, httpContextAccessor)
    {
        _permissionContext = permissionContext;
        _tenantManager = tenantManager;
        _buildVersion = buildVersion;
    }

    /// <summary>
    /// Returns the current build version.
    /// </summary>
    /// <short>Get the current build version</short>
    /// <category>Versions</category>
    /// <path>api/2.0/settings/version/build</path>
    /// <httpMethod>GET</httpMethod>
    /// <requiresAuthorization>false</requiresAuthorization>
    /// <returns>Current DocSpace, Community Server, Document Server, Mail Server, XMPP server versions</returns>
    [AllowAnonymous]
    [AllowNotPayment]
    [HttpGet("version/build")]
    public async Task<BuildVersion> GetBuildVersionsAsync()
    {
        return await _buildVersion.GetCurrentBuildVersionAsync();
    }

    /// <summary>
    /// Returns a list of the availibe portal versions including the current version.
    /// </summary>
    /// <short>
    /// Get the portal versions
    /// </short>
    /// <category>Versions</category>
    /// <path>api/2.0/settings/version</path>
    /// <httpMethod>GET</httpMethod>
    /// <returns>List of availibe portal versions including the current version</returns>
    [HttpGet("version")]
    public TenantVersionDto GetVersions()
    {
        return new TenantVersionDto(Tenant.Version, _tenantManager.GetTenantVersions());
    }

    /// <summary>
    /// Sets a version with the ID specified in the request to the current tenant.
    /// </summary>
    /// <short>
    /// Change the portal version
    /// </short>
    /// <category>Versions</category>
    /// <param type="ASC.Web.Api.ApiModel.RequestsDto.SettingsRequestsDto, ASC.Web.Api.ApiModel.RequestsDto" name="inDto">Settings request parameters: VersionId (integer) - version ID</param>
    /// <path>api/2.0/settings/version</path>
    /// <httpMethod>PUT</httpMethod>
    /// <returns>List of availibe portal versions including the current version</returns>
    [HttpPut("version")]
    public TenantVersionDto SetVersion(SettingsRequestsDto inDto)
    {
        _permissionContext.DemandPermissions(SecutiryConstants.EditPortalSettings);

        _tenantManager.GetTenantVersions().FirstOrDefault(r => r.Id == inDto.VersionId).NotFoundIfNull();
        _tenantManager.SetTenantVersion(Tenant, inDto.VersionId);

        return GetVersions();
    }
}
