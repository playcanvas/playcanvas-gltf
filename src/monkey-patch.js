pc.GraphicsDevice.prototype.uploadTexture = function (texture) {
    var gl = this.gl;

    if (! texture._needsUpload && ((texture._needsMipmapsUpload && texture._mipmapsUploaded) || ! texture._pot))
        return;

    var mipLevel = 0;
    var mipObject;
    var resMult;

    while (texture._levels[mipLevel] || mipLevel === 0) {
        // Upload all existing mip levels. Initialize 0 mip anyway.

        if (! texture._needsUpload && mipLevel === 0) {
            mipLevel++;
            continue;
        } else if (mipLevel && (! texture._needsMipmapsUpload || ! texture._mipmaps)) {
            break;
        }

        mipObject = texture._levels[mipLevel];

        if (mipLevel == 1 && ! texture._compressed) {
            // We have more than one mip levels we want to assign, but we need all mips to make
            // the texture complete. Therefore first generate all mip chain from 0, then assign custom mips.
            gl.generateMipmap(texture._glTarget);
            texture._mipmapsUploaded = true;
        }

        if (texture._cubemap) {
            // ----- CUBEMAP -----
            var face;

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

            if ((mipObject[0] instanceof HTMLCanvasElement) || (mipObject[0] instanceof HTMLImageElement) || (mipObject[0] instanceof HTMLVideoElement)) {
                // Upload the image, canvas or video
                for (face = 0; face < 6; face++) {
                    if (! texture._levelsUpdated[0][face])
                        continue;

                    var src = mipObject[face];
                    // Downsize images that are too large to be used as cube maps
                    if (src instanceof HTMLImageElement) {
                        if (src.width > this.maxCubeMapSize || src.height > this.maxCubeMapSize) {
                            src = _downsampleImage(src, this.maxCubeMapSize);
                            if (mipLevel===0) {
                                texture.width = src.width;
                                texture.height = src.height;
                            }
                        }
                    }

                    gl.texImage2D(
                        gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                        mipLevel,
                        texture._glInternalFormat,
                        texture._glFormat,
                        texture._glPixelType,
                        src
                    );
                }
            } else {
                // Upload the byte array
                resMult = 1 / Math.pow(2, mipLevel);
                for (face = 0; face < 6; face++) {
                    if (! texture._levelsUpdated[0][face])
                        continue;

                    var texData = mipObject[face];
                    if (texture._compressed) {
                        gl.compressedTexImage2D(
                            gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                            mipLevel,
                            texture._glInternalFormat,
                            Math.max(texture._width * resMult, 1),
                            Math.max(texture._height * resMult, 1),
                            0,
                            texData
                        );
                    } else {
                        gl.texImage2D(
                            gl.TEXTURE_CUBE_MAP_POSITIVE_X + face,
                            mipLevel,
                            texture._glInternalFormat,
                            Math.max(texture._width * resMult, 1),
                            Math.max(texture._height * resMult, 1),
                            0,
                            texture._glFormat,
                            texture._glPixelType,
                            texData
                        );
                    }
                }
            }
        } else if (texture._volume) {
            // ----- 3D -----
            // Image/canvas/video not supported (yet?)
            // Upload the byte array
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            resMult = 1 / Math.pow(2, mipLevel);
            if (texture._compressed) {
                gl.compressedTexImage3D(gl.TEXTURE_3D,
                                        mipLevel,
                                        texture._glInternalFormat,
                                        Math.max(texture._width * resMult, 1),
                                        Math.max(texture._height * resMult, 1),
                                        Math.max(texture._depth * resMult, 1),
                                        0,
                                        mipObject);
            } else {
                gl.texImage3D(gl.TEXTURE_3D,
                              mipLevel,
                              texture._glInternalFormat,
                              Math.max(texture._width * resMult, 1),
                              Math.max(texture._height * resMult, 1),
                              Math.max(texture._depth * resMult, 1),
                              0,
                              texture._glFormat,
                              texture._glPixelType,
                              mipObject);
            }
        } else {
            // ----- 2D -----
            if ((mipObject instanceof HTMLCanvasElement) || (mipObject instanceof HTMLImageElement) || (mipObject instanceof HTMLVideoElement)) {
                // Downsize images that are too large to be used as textures
                if (mipObject instanceof HTMLImageElement) {
                    if (mipObject.width > this.maxTextureSize || mipObject.height > this.maxTextureSize) {
                        mipObject = _downsampleImage(mipObject, this.maxTextureSize);
                        if (mipLevel===0) {
                            texture.width = mipObject.width;
                            texture.height = mipObject.height;
                        }
                    }
                }

                // Upload the image, canvas or video
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    mipLevel,
                    texture._glInternalFormat,
                    texture._glFormat,
                    texture._glPixelType,
                    mipObject
                );
            } else {
                // Upload the byte array
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                resMult = 1 / Math.pow(2, mipLevel);
                if (texture._compressed) {
                    gl.compressedTexImage2D(
                        gl.TEXTURE_2D,
                        mipLevel,
                        texture._glInternalFormat,
                        Math.max(texture._width * resMult, 1),
                        Math.max(texture._height * resMult, 1),
                        0,
                        mipObject
                    );
                } else {
                    gl.texImage2D(
                        gl.TEXTURE_2D,
                        mipLevel,
                        texture._glInternalFormat,
                        Math.max(texture._width * resMult, 1),
                        Math.max(texture._height * resMult, 1),
                        0,
                        texture._glFormat,
                        texture._glPixelType,
                        mipObject
                    );
                }
            }

            if (mipLevel === 0) {
                texture._mipmapsUploaded = false;
            } else {
                texture._mipmapsUploaded = true;
            }
        }
        mipLevel++;
    }

    if (texture._needsUpload) {
        if (texture._cubemap) {
            for(var i = 0; i < 6; i++)
                texture._levelsUpdated[0][i] = false;
        } else {
            texture._levelsUpdated[0] = false;
        }
    }

    if (! texture._compressed && texture._mipmaps && texture._needsMipmapsUpload && texture._pot && texture._levels.length === 1) {
        gl.generateMipmap(texture._glTarget);
        texture._mipmapsUploaded = true;
    }
};
