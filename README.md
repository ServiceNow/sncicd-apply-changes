# ServiceNow CI/CD GitHub Action for Apply Changes

This action applies changes from a remote source control to a specified local application

# Usage
## Step 1: Collect the data from ServiceNow
Collect all required data from the ServiceNow - username, password, instance, application sys_id or scope
## Step 2: Configure Secrets in your GitHub repository
On GitHub, go in your repository settings, click on the secret _Secrets_ and create a new secret.

Create secrets called 
- `SNOW_USERNAME`
- `SNOW_PASSWORD`
- `SNOW_SOURCE_INSTANCE` **domain** only required from the url like https://**domain**.service-now.com
- `APP_SYS_ID` or `APP_SCOPE`

## Step 3: Configure the GitHub action
```yaml
- name: Apply Changes
  uses: ServiceNow/sncicd_apply_changes@1.0 # like username/repo-name
  env:
    snowUsername: ${{ secrets.SNOW_USERNAME }}
    snowPassword: ${{ secrets.SNOW_PASSWORD }}
    snowSourceInstance: ${{ secrets.SNOW_SOURCE_INSTANCE }}
    appSysID: ${{ secrets.APP_SYS_ID }}
    appScope: ${{ secrets.APP_SCOPE }}
```
Environment variable should be set up in the Step 1
- snowUsername - Username to ServiceNow instance
- snowPassword - Password to ServiceNow instance
- snowSourceInstance ServiceNow instance where application is developing
- appSysID - Required if app_scope is not specified. The sys_id of the application for which to apply the changes
- appScope - Required if app_sys_id is not specified. The scope name of the application for which to apply the changes, such as x_aah_custom_app

## Tests

Tests should be ran via npm commands:

#### Unit tests
```shell script
npm run test
```   

#### Integration test
```shell script
npm run integration
```   

## Build

```shell script
npm run buid
```

## Formatting and Linting
```shell script
npm run format
npm run lint
```

## Support Model

ServiceNow built this integration with the intent to help customers get started faster in adopting CI/CD APIs for DevOps workflows, but __will not be providing formal support__. This integration is therefore considered "use at your own risk", and will rely on the open-source community to help drive fixes and feature enhancements via Issues. Occasionally, ServiceNow may choose to contribute to the open-source project to help address the highest priority Issues, and will do our best to keep the integrations updated with the latest API changes shipped with family releases. This is a good opportunity for our customers and community developers to step up and help drive iteration and improvement on these open-source integrations for everyone's benefit. 

## Governance Model

Initially, ServiceNow product management and engineering representatives will own governance of these integrations to ensure consistency with roadmap direction. In the longer term, we hope that contributors from customers and our community developers will help to guide prioritization and maintenance of these integrations. At that point, this governance model can be updated to reflect a broader pool of contributors and maintainers. 
