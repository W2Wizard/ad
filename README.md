# Codam AD

Interactive animated AD of a memory game for Codam College.

## How to build

I used [Bun](https://bun.sh/), but there is a specific build command for node / npm if you want to use that.
(Guess what that also uses bun!)

```bash
# Install bun
curl -fsSL https://bun.sh/install | bash
# Install dependencies
bun install # or npm install
# Build the project
bun build # or npm run build:node
# Run the project
bun run ./dist.index.html
# or
ptyhon3 -m http.server 8000
```

## WHY does this have a build step?
Because it makes the bundle size smaller by minifying the code and removing unused code / comments.
