---
title: jbpm kjar deployment descriptor
date: 2019-05-11 12:07:10
categories:
- blog
- jbpm
tags: 
- jbpm
- kjar
---
## Question
### deployment descriptor
which should be used, _kie-deployment-descriptor.xml_ or _kie-wb-deployment-descriptor.xml_?

<!--more-->

**project level kie-deployment-descriptor.xml; application level kie-wb-deployment-descriptor.xml.** application level is for all projects. In my point of view, project level is kjar, application level is war or ear.

The deployment descriptor allow you to define descriptors to each deployment items to get fine grained control. Generally, the file is called *__kie-deployment-descriptor.xml__* and you should place this file next to your *kmodule.xml* file in the META-INF folder. You can change this default location (and the filename) by specifying it as a system parameter:
```java
-Dorg.kie.deployment.desc.location=file:/path/to/file/company-deployment-descriptor.xml
```
These descriptors allow you to configure the execution server on multiple levels (server level default, different deployment descriptor per kjar and so on). 

Deployment descriptors allow the user to configure the execution server on multiple levels:
- server level: the main level and the one that applies to all kjars deployed on the server.
- kjar level: this allows you to configure descriptors on a per kjar basis.
- deploy time level: descriptors that apply while a kjar is being deployed.

The hierarchy works like this: deploy time configuration > kjar configuration > server configuration

#### noteworthy article
https://access.redhat.com/documentation/en-us/red_hat_jboss_bpm_suite/6.1/html/administration_and_configuration_guide/sect-deployment_descriptors

### some articles
http://mswiderski.blogspot.com/2014/

### Overview of jBPM

http://mswiderski.blogspot.com/2014/12/keep-your-jbpm-environment-healthy.html

http://mswiderski.blogspot.com/2014/11/cross-framework-services-in-jbpm-62.html

### jbpm integration with Spring

http://mswiderski.blogspot.com/2014/01/jbpm-6-with-spring.html
