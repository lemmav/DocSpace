// ------------------------------------------------------------------------------
//  Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.  See License in the project root for license information.
// ------------------------------------------------------------------------------

using System.Collections.Generic;

using Microsoft.Graph;

// **NOTE** This file was generated by a tool and any changes will be overwritten.

namespace Microsoft.OneDrive.Sdk
{
    /// <summary>
    /// The interface IOneDriveDrivesCollectionRequestBuilder.
    /// </summary>
    public partial interface IOneDriveDrivesCollectionRequestBuilder
    {
        /// <summary>
        /// Builds the request.
        /// </summary>
        /// <returns>The built request.</returns>
        IOneDriveDrivesCollectionRequest Request();

        /// <summary>
        /// Builds the request.
        /// </summary>
        /// <param name="options">The query and header options for the request.</param>
        /// <returns>The built request.</returns>
        IOneDriveDrivesCollectionRequest Request(IEnumerable<Option> options);

        /// <summary>
        /// Gets an <see cref="IDriveRequestBuilder"/> for the specified Drive.
        /// </summary>
        /// <param name="id">The ID for the Drive.</param>
        /// <returns>The <see cref="IDriveRequestBuilder"/>.</returns>
        IDriveRequestBuilder this[string id] { get; }
    }
}
