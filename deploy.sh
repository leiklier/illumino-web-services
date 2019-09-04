# This script is run each time a new commit is pushed
# to the current branch. It may also be run manually
# to install latest updates.

#!/usr/bin/env bash

git pull origin

yarn install

yarn restart