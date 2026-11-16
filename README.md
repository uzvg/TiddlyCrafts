# TiddlyCrafts

UZVG's TiddlyCrafts

## Usage

```sh
bun run start   # or npm start
```

Then open http://127.0.0.1:9100 manually.

## Images

Raster images (`png`, `jpg`, `jpeg`, `gif`, `webp`, `ico`, `bmp`, `tif`, `tiff`, `avif`)
are stored with [Git LFS](https://git-lfs.com) — see `.gitattributes`. Install it once
before cloning, otherwise images arrive as pointer files:

```sh
git lfs install
```

## Notice:

Don’t run `bun run build` locally. It’s used for deploying to a remote server and will modify files in the local repository.
