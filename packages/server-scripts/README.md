<!--
Copyright 2019 Ludan Stoecklé
SPDX-License-Identifier: CC-BY-4.0
-->
# RosaeNLG Server Scripts

For documentation, see [RosaeNLG main documentation](https://rosaenlg.org).

```bash
# delete everything on dev
aws s3 --profile s3_lambda_migration rm s3://rosaenlg-lambda-bucket-dev --recursive

# copy from prod to dev
# aws s3 --profile s3_lambda_migration cp s3://rosaenlg-lambda-bucket-prod/ s3://rosaenlg-lambda-bucket-dev/ --recursive

# copy from prod to local
aws s3 --profile s3_lambda_migration cp s3://rosaenlg-lambda-bucket-prod/ ./mirror --recursive

# migrate
node ./src/migrate.js

# copy from local to dev
aws s3 --profile s3_lambda_migration cp ./mirror s3://rosaenlg-lambda-bucket-dev/ --recursive
```
