## Deploying functions to Google Cloud

Functions are deployed through Google Cloud Build by means of the
[cloudbuild.yaml](cloudbuild.yaml) file. For the deployment to be successful,
there should be a few pre-requisites fulfilled:

- Cloud Build should have the permissions to deploy Cloud Functions
as described on [this page](https://cloud.google.com/cloud-build/docs/configuring-builds/build-test-deploy-artifacts)
- [Cloud Build trigger](https://cloud.google.com/cloud-build/docs/running-builds/automate-builds) should be configured, pointing to either the original
repository or its copy of in the Google Source Code, along with the
required substitution variables (see `substitutions:` section in
[cloudbuild.yaml](cloudbuild.yaml).

Before GCP Cloud Build Trigger can be configured there is a need to to
link the Bitbucket repository to a Google Cloud Source repo so that it
becomes an automatic mirror of the former. It is also possible to set
up Cloud Build triggers to work directly off Bitbucket (or GitHub),
but it is preferable to do it this way (through Cloud Source) instead
since it allows one to hook StackDriver for any monitoring or
debugging purposes later on.

It is worth noting that Cloud Build trigger can only be set for a source
repository which makes it harder to promote binary artefacts and
define the deployment flow, thus to configure builds for different
environments one can employ either branching model or to use a simple
push trigger to `master` branch for Dev deployments and a release tag
for promotion to any other environment.

### Setting it up

To set up [`gcloud`](https://cloud.google.com/sdk/gcloud/) command line
interface follow one of the Google guides, once set up, it is advised to
use separate configurations for different Google accounts, say for configuring
`your-dev`, follow the below procedure:

    gcloud config configurations create your-dev
    gcloud config set account <your Google account email>
    gcloud config set project your-dev
    gcloud config set compute/zone us-central1

One can always list all configurations and their settings by issuing a command

    gcloud config configurations list

The list will look mostly like the following

    NAME                  IS_ACTIVE  ACCOUNT                        PROJECT                  DEFAULT_ZONE            DEFAULT_REGION
    default               False      email1@domain       project-name-1      region
    your-dev        True       user.name@email.domain   your-dev              us-central1             us-central1-a
    ...

In case the configuration item for the project is not active (`False` value
in the `IS_ACTIVE` column), use

    gcloud config configuration activate your-dev

to activate it
