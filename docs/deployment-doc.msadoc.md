# MSAdoc Format Specification (deployment-doc)

The presented format is currently under development and might change over time.

## Base Data

### `name` (string) **[mandatory]**

The name of the deployment environment. The `name` is used as key to identify and reference deployments.
#### Example
```json
{
    "name": "prod",
}
```
#### Best Practices
* Use a consistent naming scheme across all deployments.
* Don't use spaces - otherwise API requests filtering by name might not work.


### `kubernetesLabels` (string[])

A list of labels, all used for filtering out the resources of this deployment environment.
#### Example
```json
{
    "name": "prod",
    "kubernetesLabels": [
        "app=ods",
        "stage=prod",
    ],
}
```
#### Best Practices
* If not existing yet, add those labels to your kubernetes deployment files.
* Use a consistent naming scheme for tagging your deployment environments and applications in k8s.


## K8s Cluster Information

### `kubernetesUrl` (string) **[mandatory]**

An URL or IP address pointing to one of the k8s master nodes.
#### Example
```json
{
    "name": "PipelineService",
    "kubernetesUrl": "https://131.188.64.201:6443",
}
```

### `kubernetesSkipTlsVerify` (boolean)

Flag if TLS verification should be skipped - `false` by default.
#### Example
```json
{
    "name": "PipelineService",
    "kubernetesSkipTlsVerify": true,
}
```

### `kubernetesCa` (string)

Certificate authority data. Resembles the field `certificate-authority-data` in your `kube-config` file.
#### Example
```json
{
    "name": "PipelineService",
    "kubernetesCa": "...your-secret",
}
```
#### Best Practices
* Don't expose these kinds of secrets to version control. Use an environment variable instead that is available in your CI/CD pipeline.



## K8s User Information


### `kubernetesUser` (string) **[mandatory]**

The k8s username used to sign in.
#### Example
```json
{
    "name": "PipelineService",
    "kubernetesUser": "msadoc-user",
}
```
#### Best Practices
* Create a dedicated k8s user for `msadoc` with read priviledges on the resources you want to monitor.


### `kubernetesPassword` (string)

The password for the k8s user (if password authentication is used).
#### Example
```json
{
    "name": "PipelineService",
    "kubernetesPassword": "mypassword",
}
```
#### Best Practices
* Don't expose these kinds of secrets to version control. Use an environment variable instead that is available in your CI/CD pipeline.


### `kubernetesUserCert` (string)

The certificate of the k8s user (if authentication via certificate and key is used). Resembles the field `client-certificate-data` in your `kube-config` file.
#### Example
```json
{
    "name": "PipelineService",
    "kubernetesUserCert": "mycert",
}
```
#### Best Practices
* Don't expose these kinds of secrets to version control. Use an environment variable instead that is available in your CI/CD pipeline.


### `kubernetesUserKey` (string)

The key of the k8s user (if authentication via certificate and key is used). Resembles the field `client-key-data` in your `kube-config` file.
#### Example
```json
{
    "name": "PipelineService",
    "kubernetesUserKey": "mykey",
}
```
#### Best Practices
* Don't expose these kinds of secrets to version control. Use an environment variable instead that is available in your CI/CD pipeline.
