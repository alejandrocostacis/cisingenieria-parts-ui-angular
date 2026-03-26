# Parts System AngularJS UI

## Requirements

- NodeJS

- bower client

```bash
npm install bower -g
```

- Gulp

```bash
npm install gulp -g
```

- Python (node-gyp requires it)

```bash
pyenv install 2.7.18
pyenv local 2.7.18
```

## Develop

```bash
npm install
bower install
gulp serve
```

## Common issues

- When running `gulp serve`

  - Problem:

    ```bash
    Error: watch /home/steve/repos/cis/parts-ui-angular/src/ ENOSPC
        at _errnoException (util.js:1003:13)
    ```

  - Solution:

    ```bash
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    ```

## AWS-S3 Deploy Prod

```bash
nvm use
rm -rf node_modules && rm -rf bower_components && npm install && bower install && gulp clean && gulp build
aws s3 rm s3://gestion2.cis-ingenieria.com --recursive --profile cis
aws s3 sync ./dist/ s3://gestion2.cis-ingenieria.com --profile cis
```

## AWS-S3 Deploy UAT

```bash
nvm use
rm -rf node_modules && rm -rf bower_components && npm install && bower install && gulp clean && gulp build-uat
aws s3 rm s3://gestion2-uat.cis-ingenieria.com --recursive --profile cis
aws s3 sync ./dist/ s3://gestion2-uat.cis-ingenieria.com --profile cis
```
