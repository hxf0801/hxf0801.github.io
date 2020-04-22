---
title: vagrant oracle
date: 2020-04-22 16:56:35
categories:
- blog
- vagrant
tags:
- vagrant
- oracle
---
Refer to [Oracle Vagrant Boxes](https://github.com/oracle/vagrant-boxes).

The [Oracle Database 12.2.0.1 customization example](./resize-vagrant-vm-disk/Vagrantfile) is based on Oracle Vagrant Boxes.

<!--more-->

Some commands:
1. sqlplus system/oracle@localhost:1521/devdb @oneScript.sql
2. execute sqlplus command:
    [oracle@oracle-12201-vagrant devdb]$ sqlplus system/oracle@//localhost:1521/devdb
    SQL*Plus: Release 12.2.0.1.0 Production on Fri Apr 17 21:20:48 2020

    Copyright (c) 1982, 2016, Oracle.  All rights reserved.

    Last Successful login time: Fri Apr 17 2020 21:00:49 -04:00

    Connected to:
    Oracle Database 12c Enterprise Edition Release 12.2.0.1.0 - 64bit Production

    SQL> 
    SQL> create or replace directory FINSHARE_DUMP_DIR as '/home/oracle/devdb/current_dump'
3. put dump file cda.dmp into folder /home/oracle/devdb/current_dump; run oracle import utility tool impdp as below:
    [oracle@oracle-12201-vagrant devdb]$ mkdir logs
    [oracle@oracle-12201-vagrant devdb]$ ll
    total 4
    drwxr-xr-x. 2 oracle oinstall   6 Apr 17 20:45 logs
    [oracle@oracle-12201-vagrant devdb]$ 
    [oracle@oracle-12201-vagrant devdb]$ impdp system/oracle@//localhost:1521/devdb DIRECTORY=FINSHARE_DUMP_DIR DUMPFILE=sample.dmp LOGFILE=sample.log
