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

namespace ASC.Files.Tests;

[TestFixture]
class Favorites : BaseFilesTests
{
    private FolderDto<int> TestFolder { get; set; }
    public FileDto<int> TestFile { get; private set; }

    public IEnumerable<int> folderIds;
    public IEnumerable<int> fileIds;

    [OneTimeSetUp]
    public override async Task SetUp()
    {
        await base.SetUp();
        TestFolder = await FoldersControllerHelper.CreateFolderAsync(GlobalFolderHelper.FolderMy, "TestFolder").ConfigureAwait(false);
        TestFile = await FilesControllerHelper.CreateFileAsync(GlobalFolderHelper.FolderMy, "TestFile", default, default).ConfigureAwait(false);
        folderIds = new List<int> { TestFolder.Id };
        fileIds = new List<int> { TestFile.Id };
    }

    [OneTimeSetUp]
    public void Authenticate()
    {
        SecurityContext.AuthenticateMe(CurrentTenant.OwnerId);
    }

    [OneTimeTearDown]
    public async Task TearDown()
    {
        await DeleteFolderAsync(TestFolder.Id);
        await DeleteFileAsync(TestFile.Id);
    }

    [TestCaseSource(typeof(DocumentData), nameof(DocumentData.GetCreateFolderItems))]
    [Category("Folder")]
    [Order(1)]
    public void CreateFolderReturnsFolderWrapper(string folderTitle)
    {
        var folderWrapper = Assert.ThrowsAsync<InvalidOperationException>(async () => await FoldersControllerHelper.CreateFolderAsync(await GlobalFolderHelper.FolderFavoritesAsync, folderTitle));
        Assert.That(folderWrapper.Message == "You don't have enough permission to create");
    }

    [TestCaseSource(typeof(DocumentData), nameof(DocumentData.GetCreateFileItems))]
    [Category("File")]
    [Order(1)]
    public async Task CreateFileReturnsFolderWrapper(string fileTitle)
    {
        var fileWrapper = await FilesControllerHelper.CreateFileAsync(await GlobalFolderHelper.FolderShareAsync, fileTitle, default, default);
        Assert.AreEqual(fileWrapper.FolderId, GlobalFolderHelper.FolderMy);
    }

    [Test]
    [Category("Favorite")]
    [Order(2)]
    public async Task GetFavoriteFolderToFolderWrapper()
    {
        var favorite = await FileStorageService.AddToFavoritesAsync(folderIds, fileIds);

        Assert.IsNotNull(favorite);
    }
    [Test]
    [Category("Favorite")]
    [Order(3)]
    public async Task DeleteFavoriteFolderToFolderWrapper()
    {
        var favorite = await FileStorageService.DeleteFavoritesAsync(folderIds, fileIds);

        Assert.IsNotNull(favorite);

    }


}
