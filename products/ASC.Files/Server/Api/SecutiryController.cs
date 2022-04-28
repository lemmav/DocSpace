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

namespace ASC.Files.Api;

[ConstraintRoute("int")]
public class SecutiryControllerInternal : SecutiryController<int>
{
    public SecutiryControllerInternal(FileStorageService<int> fileStorageService, SecurityControllerHelper<int> securityControllerHelper) : base(fileStorageService, securityControllerHelper)
    {
    }
}

public class SecutiryControllerThirdparty : SecutiryController<string>
{
    public SecutiryControllerThirdparty(FileStorageService<string> fileStorageService, SecurityControllerHelper<string> securityControllerHelper) : base(fileStorageService, securityControllerHelper)
    {
    }
}

public abstract class SecutiryController<T> : ApiControllerBase
{
    private readonly FileStorageService<T> _fileStorageService;
    private readonly SecurityControllerHelper<T> _securityControllerHelper;

    public SecutiryController(FileStorageService<T> fileStorageService, SecurityControllerHelper<T> securityControllerHelper)
    {
        _fileStorageService = fileStorageService;
        _securityControllerHelper = securityControllerHelper;
    }

    /// <summary>
    ///   Returns the external link to the shared file with the ID specified in the request
    /// </summary>
    /// <summary>
    ///   File external link
    /// </summary>
    /// <param name="fileId">File ID</param>
    /// <param name="share">Access right</param>
    /// <category>Files</category>
    /// <returns>Shared file link</returns>
    [Update("{fileId}/sharedlinkAsync")]
    public async Task<object> GenerateSharedLinkFromBodyAsync(T fileId, [FromBody] GenerateSharedLinkRequestDto inDto)
    {
        return await _securityControllerHelper.GenerateSharedLinkAsync(fileId, inDto.Share);
    }

    [Update("{fileId}/sharedlinkAsync")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<object> GenerateSharedLinkFromFormAsync(T fileId, [FromForm] GenerateSharedLinkRequestDto inDto)
    {
        return await _securityControllerHelper.GenerateSharedLinkAsync(fileId, inDto.Share);
    }

    /// <summary>
    /// Returns the detailed information about shared file with the ID specified in the request
    /// </summary>
    /// <short>File sharing</short>
    /// <category>Sharing</category>
    /// <param name="fileId">File ID</param>
    /// <returns>Shared file information</returns>
    [Read("file/{fileId}/share")]
    public Task<IEnumerable<FileShareDto>> GetFileSecurityInfoAsync(T fileId)
    {
        return _securityControllerHelper.GetFileSecurityInfoAsync(fileId);
    }

    /// <summary>
    /// Returns the detailed information about shared folder with the ID specified in the request
    /// </summary>
    /// <short>Folder sharing</short>
    /// <param name="folderId">Folder ID</param>
    /// <category>Sharing</category>
    /// <returns>Shared folder information</returns>
    [Read("folder/{folderId}/share")]
    public Task<IEnumerable<FileShareDto>> GetFolderSecurityInfoAsync(T folderId)
    {
        return _securityControllerHelper.GetFolderSecurityInfoAsync(folderId);
    }

    [Update("{fileId}/setacelink")]
    public Task<bool> SetAceLinkAsync(T fileId, [FromBody] GenerateSharedLinkRequestDto inDto)
    {
        return _fileStorageService.SetAceLinkAsync(fileId, inDto.Share);
    }

    /// <summary>
    /// Sets sharing settings for the file with the ID specified in the request
    /// </summary>
    /// <param name="fileId">File ID</param>
    /// <param name="share">Collection of sharing rights</param>
    /// <param name="notify">Should notify people</param>
    /// <param name="sharingMessage">Sharing message to send when notifying</param>
    /// <short>Share file</short>
    /// <category>Sharing</category>
    /// <remarks>
    /// Each of the FileShareParams must contain two parameters: 'ShareTo' - ID of the user with whom we want to share and 'Access' - access type which we want to grant to the user (Read, ReadWrite, etc) 
    /// </remarks>
    /// <returns>Shared file information</returns>
    [Update("file/{fileId}/share")]
    public Task<IEnumerable<FileShareDto>> SetFileSecurityInfoFromBodyAsync(T fileId, [FromBody] SecurityInfoRequestDto inDto)
    {
        return _securityControllerHelper.SetFileSecurityInfoAsync(fileId, inDto.Share, inDto.Notify, inDto.SharingMessage);
    }

    [Update("file/{fileId}/share")]
    [Consumes("application/x-www-form-urlencoded")]
    public Task<IEnumerable<FileShareDto>> SetFileSecurityInfoFromFormAsync(T fileId, [FromForm] SecurityInfoRequestDto inDto)
    {
        return _securityControllerHelper.SetFileSecurityInfoAsync(fileId, inDto.Share, inDto.Notify, inDto.SharingMessage);
    }

    /// <summary>
    /// Sets sharing settings for the folder with the ID specified in the request
    /// </summary>
    /// <short>Share folder</short>
    /// <param name="folderId">Folder ID</param>
    /// <param name="share">Collection of sharing rights</param>
    /// <param name="notify">Should notify people</param>
    /// <param name="sharingMessage">Sharing message to send when notifying</param>
    /// <remarks>
    /// Each of the FileShareParams must contain two parameters: 'ShareTo' - ID of the user with whom we want to share and 'Access' - access type which we want to grant to the user (Read, ReadWrite, etc) 
    /// </remarks>
    /// <category>Sharing</category>
    /// <returns>Shared folder information</returns>
    [Update("folder/{folderId}/share")]
    public Task<IEnumerable<FileShareDto>> SetFolderSecurityInfoFromBodyAsync(T folderId, [FromBody] SecurityInfoRequestDto inDto)
    {
        return _securityControllerHelper.SetFolderSecurityInfoAsync(folderId, inDto.Share, inDto.Notify, inDto.SharingMessage);
    }

    [Update("folder/{folderId}/share")]
    [Consumes("application/x-www-form-urlencoded")]
    public Task<IEnumerable<FileShareDto>> SetFolderSecurityInfoFromFormAsync(T folderId, [FromForm] SecurityInfoRequestDto inDto)
    {
        return _securityControllerHelper.SetFolderSecurityInfoAsync(folderId, inDto.Share, inDto.Notify, inDto.SharingMessage);
    }
}

public class SecutiryControllerCommon : ApiControllerBase
{
    private readonly FileStorageService<int> _fileStorageServiceInt;
    private readonly FileStorageService<string> _fileStorageServiceString;
    private readonly SecurityControllerHelper<int> _securityControllerHelperInt;
    private readonly SecurityControllerHelper<string> _securityControllerHelperString;

    public SecutiryControllerCommon(
        FileStorageService<int> fileStorageServiceInt,
        FileStorageService<string> fileStorageServiceString,
        SecurityControllerHelper<int> securityControllerHelperInt,
        SecurityControllerHelper<string> securityControllerHelperString)
    {
        _fileStorageServiceInt = fileStorageServiceInt;
        _fileStorageServiceString = fileStorageServiceString;
        _securityControllerHelperInt = securityControllerHelperInt;
        _securityControllerHelperString = securityControllerHelperString;
    }

    [Create("owner")]
    public async Task<IEnumerable<FileEntryDto>> ChangeOwnerFromBodyAsync([FromBody] ChangeOwnerRequestDto inDto)
    {
        return await ChangeOwnerAsync(inDto);
    }

    [Create("owner")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IEnumerable<FileEntryDto>> ChangeOwnerFromFormAsync([FromForm] ChangeOwnerRequestDto inDto)
    {
        return await ChangeOwnerAsync(inDto);
    }


    [Create("share")]
    public async Task<IEnumerable<FileShareDto>> GetSecurityInfoFromBodyAsync([FromBody] BaseBatchRequestDto inDto)
    {
        var (folderIntIds, folderStringIds) = FileOperationsManager.GetIds(inDto.FolderIds);
        var (fileIntIds, fileStringIds) = FileOperationsManager.GetIds(inDto.FileIds);

        var result = new List<FileShareDto>();
        result.AddRange(await _securityControllerHelperInt.GetSecurityInfoAsync(fileIntIds, folderIntIds));
        result.AddRange(await _securityControllerHelperString.GetSecurityInfoAsync(fileStringIds, folderStringIds));

        return result;
    }

    [Create("share")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IEnumerable<FileShareDto>> GetSecurityInfoFromFormAsync([FromForm][ModelBinder(BinderType = typeof(BaseBatchModelBinder))] BaseBatchRequestDto inDto)
    {
        var (folderIntIds, folderStringIds) = FileOperationsManager.GetIds(inDto.FolderIds);
        var (fileIntIds, fileStringIds) = FileOperationsManager.GetIds(inDto.FileIds);

        var result = new List<FileShareDto>();
        result.AddRange(await _securityControllerHelperInt.GetSecurityInfoAsync(fileIntIds, folderIntIds));
        result.AddRange(await _securityControllerHelperString.GetSecurityInfoAsync(fileStringIds, folderStringIds));

        return result;
    }

    /// <summary>
    ///   Removes sharing rights for the group with the ID specified in the request
    /// </summary>
    /// <param name="folderIds">Folders ID</param>
    /// <param name="fileIds">Files ID</param>
    /// <short>Remove group sharing rights</short>
    /// <category>Sharing</category>
    /// <returns>Shared file information</returns>
    [Delete("share")]
    public async Task<bool> RemoveSecurityInfoAsync(BaseBatchRequestDto inDto)
    {
        var (folderIntIds, folderStringIds) = FileOperationsManager.GetIds(inDto.FolderIds);
        var (fileIntIds, fileStringIds) = FileOperationsManager.GetIds(inDto.FileIds);

        await _securityControllerHelperInt.RemoveSecurityInfoAsync(fileIntIds, folderIntIds);
        await _securityControllerHelperString.RemoveSecurityInfoAsync(fileStringIds, folderStringIds);

        return true;
    }


    [Update("share")]
    public Task<IEnumerable<FileShareDto>> SetSecurityInfoFromBodyAsync([FromBody] SecurityInfoRequestDto inDto)
    {
        return SetSecurityInfoAsync(inDto);
    }

    [Update("share")]
    [Consumes("application/x-www-form-urlencoded")]
    public Task<IEnumerable<FileShareDto>> SetSecurityInfoFromFormAsync([FromForm] SecurityInfoRequestDto inDto)
    {
        return SetSecurityInfoAsync(inDto);
    }

    private async Task<IEnumerable<FileEntryDto>> ChangeOwnerAsync(ChangeOwnerRequestDto inDto)
    {
        var (folderIntIds, folderStringIds) = FileOperationsManager.GetIds(inDto.FolderIds);
        var (fileIntIds, fileStringIds) = FileOperationsManager.GetIds(inDto.FileIds);

        var data = Enumerable.Empty<FileEntry>();
        data = data.Concat(await _fileStorageServiceInt.ChangeOwnerAsync(folderIntIds, fileIntIds, inDto.UserId));
        data = data.Concat(await _fileStorageServiceString.ChangeOwnerAsync(folderStringIds, fileStringIds, inDto.UserId));

        var result = new List<FileEntryDto>();

        foreach (var e in data)
        {
            result.Add(await _securityControllerHelperInt.GetFileEntryWrapperAsync(e));
        }

        return result;
    }

    private async Task<IEnumerable<FileShareDto>> SetSecurityInfoAsync(SecurityInfoRequestDto inDto)
    {
        var (folderIntIds, folderStringIds) = FileOperationsManager.GetIds(inDto.FolderIds);
        var (fileIntIds, fileStringIds) = FileOperationsManager.GetIds(inDto.FileIds);

        var result = new List<FileShareDto>();
        result.AddRange(await _securityControllerHelperInt.SetSecurityInfoAsync(fileIntIds, folderIntIds, inDto.Share, inDto.Notify, inDto.SharingMessage));
        result.AddRange(await _securityControllerHelperString.SetSecurityInfoAsync(fileStringIds, folderStringIds, inDto.Share, inDto.Notify, inDto.SharingMessage));

        return result;
    }
}