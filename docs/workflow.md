# Build and commit workflow

My routine for each build session on this project.

1. Apply remote changes in Studio before starting (Studio, Source Control, Apply Remote Changes).
2. Check the active branch. Labs 01-15 use `csa-labs`, Labs 16-35 use `cad-labs`.
3. Do the lab work in the PDI.
4. Export the update set to the local repo folder.
5. Update the lab index in the README.
6. Commit and push: `git add .`, `git commit -m "..."`, `git push`.
7. When the lab is fully complete, merge to `main`: `git checkout main`, `git merge csa-labs`, `git push`, `git checkout csa-labs`.
8. Commit the application changes through Studio source control (Studio, Source Control, Commit Changes), then merge the dev branch to `main` with a pull request on GitHub.
