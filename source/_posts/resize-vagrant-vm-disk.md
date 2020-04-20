---
title: resize vagrant vm disk
date: 2020-04-19 19:45:51
categories:
- blog
- vm
tags:
- VirtualBox
- vagrant
- vm
---
How to increase the size of the disk for existing VirtualBox machine? Use vagrant to create and manage an VirtualBox vm hosting Oracle 12.2.0.1. Please refer to Oracle vagrant box project for more detail. But the original box has two limited disks of size 40G and 16G respectively and mounted one. Even after we increase the size of hard disk in VirtualBox manager, we still can't see the increased space when log in vm. So we need to create partition on the added space and allocate to logical volume, shown as below.

<!--more-->

1. install vagrant plugin **vagrant-disksize**

2. add new disk size to 100G configuration to Vagrantfile. Note the position
```
...
config.vm.box = "ol7-latest"
config.disksize.size = "100GB"
...
```

3. run `vagrant up` to create vm
`vagrant ssh` to vm, to create new partition with the new space. otherwise we can't see the new-added space, and only see the box's original disk size 40G
```shell    
    PS D:\ws-oracle\12.2.0.1> vagrant ssh
    getting Proxy Configuration from Host...
    
    Welcome to Oracle Linux Server release 7.8 (GNU/Linux 4.14.35-1902.300.11.el7uek.x86_64)
    
    The Oracle Linux End-User License Agreement can be viewed here:
    
      * /usr/share/eula/eula.en_US
    
    For additional packages, updates, documentation and community help, see:
    
      * https://yum.oracle.com/
    [vagrant@oracle-12201-vagrant ~]$
```

Switch to root user without entering root password.
```shell
    [vagrant@oracle-12201-vagrant ~]$ sudo su -
    [root@oracle-12201-vagrant ~]#
    
    ## check current file systems or mounted partitions
    [root@oracle-12201-vagrant ~]# df -H
    Filesystem                   Size  Used Avail Use% Mounted on
    devtmpfs                     2.0G     0  2.0G   0% /dev
    tmpfs                        2.0G     0  2.0G   0% /dev/shm
    tmpfs                        2.0G  8.9M  2.0G   1% /run
    tmpfs                        2.0G     0  2.0G   0% /sys/fs/cgroup
    /dev/mapper/vg_main-lv_root   35G   16G   20G  45% /
    /dev/sda1                    521M  127M  395M  25% /boot
    vagrant                      1.1T  340G  661G  34% /vagrant
    tmpfs                        386M     0  386M   0% /run/user/1000
```

Check all disks information. found two disks, and first disk /dev/sda has two partitions and has additional space unused. second disk /dev/sdb has no partition and are not used. we will create partition against unused disk spaces.
```shell
    [root@oracle-12201-vagrant ~]# fdisk -l

    Disk /dev/sda: 107.4 GB, 107374182400 bytes, 209715200 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disk label type: dos
    Disk identifier: 0x00087a38
    
       Device Boot      Start         End      Blocks   Id  System
    /dev/sda1   *        2048     1026047      512000   83  Linux
    /dev/sda2         1026048    77594623    38284288   8e  Linux LVM
    
    Disk /dev/sdb: 17.2 GB, 17179869184 bytes, 33554432 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    
    
    Disk /dev/mapper/vg_main-lv_root: 34.9 GB, 34904997888 bytes, 68173824 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    
    
    Disk /dev/mapper/vg_main-lv_swap: 4294 MB, 4294967296 bytes, 8388608 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    
    [root@oracle-12201-vagrant ~]#
```

Create partition on unused space on first disk _/dev/sda_.

```shell
    [root@oracle-12201-vagrant ~]# fdisk /dev/sda
    Welcome to fdisk (util-linux 2.23.2).
    
    Changes will remain in memory only, until you decide to write them.
    Be careful before using the write command.
    
    Command (m for help): m
    Command action
       a   toggle a bootable flag
       b   edit bsd disklabel
       c   toggle the dos compatibility flag
       d   delete a partition
       g   create a new empty GPT partition table
       G   create an IRIX (SGI) partition table
       l   list known partition types
       m   print this menu
       n   add a new partition
       o   create a new empty DOS partition table
       p   print the partition table
       q   quit without saving changes
       s   create a new empty Sun disklabel
       t   change a partition's system id
       u   change display/entry units
       v   verify the partition table
       w   write table to disk and exit
       x   extra functionality (experts only)
    Command (m for help): p
    
    Disk /dev/sda: 107.4 GB, 107374182400 bytes, 209715200 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disk label type: dos
    Disk identifier: 0x00087a38
    
       Device Boot      Start         End      Blocks   Id  System
    /dev/sda1   *        2048     1026047      512000   83  Linux
    /dev/sda2         1026048    77594623    38284288   8e  Linux LVM
    
    Command (m for help): n
    Partition type:
       p   primary (2 primary, 0 extended, 2 free)
       e   extended
    Select (default p):
    Using default response p
    Partition number (3,4, default 3):
    First sector (77594624-209715199, default 77594624):
    Using default value 77594624
    Last sector, +sectors or +size{K,M,G} (77594624-209715199, default 209715199):
    Using default value 209715199
    Partition 3 of type Linux and of size 63 GiB is set
    
    Command (m for help): w
    The partition table has been altered!
    
    Calling ioctl() to re-read partition table.
    
    WARNING: Re-reading the partition table failed with error 16: Device or resource busy.
    The kernel still uses the old table. The new table will be used at
    the next reboot or after you run partprobe(8) or kpartx(8)
    Syncing disks.
    [root@oracle-12201-vagrant ~]#
```

Create partition on second disk _/dev/sdb_.
```shell
    [root@oracle-12201-vagrant ~]# fdisk /dev/sdb
    Welcome to fdisk (util-linux 2.23.2).
    
    Changes will remain in memory only, until you decide to write them.
    Be careful before using the write command.
    
    Device does not contain a recognized partition table
    Building a new DOS disklabel with disk identifier 0x1d50355b.
    
    Command (m for help): p
    
    Disk /dev/sdb: 17.2 GB, 17179869184 bytes, 33554432 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disk label type: dos
    Disk identifier: 0x1d50355b
    
       Device Boot      Start         End      Blocks   Id  System
    
    Command (m for help): n
    Partition type:
       p   primary (0 primary, 0 extended, 4 free)
       e   extended
    Select (default p): p
    Partition number (1-4, default 1):
    First sector (2048-33554431, default 2048):
    Using default value 2048
    Last sector, +sectors or +size{K,M,G} (2048-33554431, default 33554431):
    Using default value 33554431
    Partition 1 of type Linux and of size 16 GiB is set
    
    Command (m for help): w
    The partition table has been altered!
    
    Calling ioctl() to re-read partition table.
    Syncing disks.
```

Check disks again. and find newly created partitions being displayed
```shell
    [root@oracle-12201-vagrant ~]# fdisk -l
    
    Disk /dev/sda: 107.4 GB, 107374182400 bytes, 209715200 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disk label type: dos
    Disk identifier: 0x00087a38
    
       Device Boot      Start         End      Blocks   Id  System
    /dev/sda1   *        2048     1026047      512000   83  Linux
    /dev/sda2         1026048    77594623    38284288   8e  Linux LVM
    /dev/sda3        77594624   209715199    66060288   83  Linux
    
    Disk /dev/sdb: 17.2 GB, 17179869184 bytes, 33554432 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disk label type: dos
    Disk identifier: 0x1d50355b
    
       Device Boot      Start         End      Blocks   Id  System
    /dev/sdb1            2048    33554431    16776192   83  Linux
    
    Disk /dev/mapper/vg_main-lv_root: 34.9 GB, 34904997888 bytes, 68173824 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    
    
    Disk /dev/mapper/vg_main-lv_swap: 4294 MB, 4294967296 bytes, 8388608 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
```

4. exit ssh, run `vagrant halt` to stop vm

5. run `vagrant up` to start vm again. and `vagrant ssh` to vm. And this time we will create physical volume on new partitions and file systems
`df (disk free)`- displays statistics information on free space of file systems
```shell    
    [vagrant@oracle-12201-vagrant ~]$ df -H
    Filesystem                   Size  Used Avail Use% Mounted on
    devtmpfs                     2.0G     0  2.0G   0% /dev
    tmpfs                        2.0G     0  2.0G   0% /dev/shm
    tmpfs                        2.0G  8.9M  2.0G   1% /run
    tmpfs                        2.0G     0  2.0G   0% /sys/fs/cgroup
    /dev/mapper/vg_main-lv_root   35G   14G   22G  40% /
    /dev/sda1                    521M  127M  395M  25% /boot
    vagrant                      1.1T  340G  661G  34% /vagrant
    tmpfs                        386M     0  386M   0% /run/user/1000
```

Switch to root user using current logon user's password, no need to enter root password 
```shell
    [vagrant@oracle-12201-vagrant ~]$ sudo su -
    Last login: Fri Apr 17 23:54:34 -04 2020 on pts/0
```

`pvs` - Display information about physical volumes
````shell
    [root@oracle-12201-vagrant ~]# pvs
      PV         VG      Fmt  Attr PSize   PFree
      /dev/sda2  vg_main lvm2 a--  <36.51g    0
```

see what are under _/dev_.
```shell
    # run "ll /dev"
    [root@oracle-12201-vagrant ~]# ll /dev | grep disk
    drwxr-xr-x. 6 root    root         120 Apr 18 14:25 disk
    brw-rw----. 1 root    disk    252,   0 Apr 18 14:26 dm-0
    brw-rw----. 1 root    disk    252,   1 Apr 18 14:26 dm-1
    crw-rw----. 1 root    disk     10, 237 Apr 18 14:26 loop-control
    brw-rw----. 1 root    disk      8,   0 Apr 18 14:26 sda
    brw-rw----. 1 root    disk      8,   1 Apr 18 14:26 sda1
    brw-rw----. 1 root    disk      8,   2 Apr 18 14:26 sda2
    brw-rw----. 1 root    disk      8,   3 Apr 18 14:26 sda3
    brw-rw----. 1 root    disk      8,  16 Apr 18 14:26 sdb
    brw-rw----. 1 root    disk      8,  17 Apr 18 14:26 sdb1
    crw-rw----. 1 root    disk     21,   0 Apr 18 14:26 sg0
    crw-rw----. 1 root    disk     21,   1 Apr 18 14:26 sg1
   
    # run "ll /dev/vg_main"
    [root@oracle-12201-vagrant ~]# ll /dev/vg_main
    total 0
    lrwxrwxrwx. 1 root root 7 Apr 18 14:26 lv_root -> ../dm-0
    lrwxrwxrwx. 1 root root 7 Apr 18 14:26 lv_swap -> ../dm-1
```

`pvcreate` - Initialize physical volume(s) for use by LVM (logical volume manager) 
```shell     
    [root@oracle-12201-vagrant ~]# pvcreate /dev/sda3
      Physical volume "/dev/sda3" successfully created.

    [root@oracle-12201-vagrant ~]# pvs
      PV         VG      Fmt  Attr PSize   PFree
      /dev/sda2  vg_main lvm2 a--  <36.51g     0
      /dev/sda3          lvm2 ---   63.00g 63.00g
    
    [root@oracle-12201-vagrant ~]# pvcreate /dev/sdb1
      Physical volume "/dev/sdb1" successfully created.
      
    [root@oracle-12201-vagrant ~]# pvs
      PV         VG      Fmt  Attr PSize   PFree
      /dev/sda2  vg_main lvm2 a--  <36.51g      0
      /dev/sda3          lvm2 ---   63.00g  63.00g
      /dev/sdb1          lvm2 ---  <16.00g <16.00g
```

`vgextend` - Add physical volumes to a volume group
```shell
    [root@oracle-12201-vagrant ~]# vgextend vg_main /dev/sda3 /dev/sdb1
      Volume group "vg_main" successfully extended
  
    # check physical volumes again
    [root@oracle-12201-vagrant ~]# pvs
      PV         VG      Fmt  Attr PSize   PFree
      /dev/sda2  vg_main lvm2 a--  <36.51g      0
      /dev/sda3  vg_main lvm2 a--  <63.00g <63.00g
      /dev/sdb1  vg_main lvm2 a--  <16.00g <16.00g
    [root@oracle-12201-vagrant ~]#

    #lvdisplay - Display information about a logical volume
    [root@oracle-12201-vagrant ~]# lvdisplay -a
      --- Logical volume ---
      LV Path                /dev/vg_main/lv_root
      LV Name                lv_root
      VG Name                vg_main
      LV UUID                h15nLk-zD4q-lECL-TvbX-mwFs-3RLZ-vSpOad
      LV Write Access        read/write
      LV Creation host, time localhost, 2020-04-07 23:22:22 -0400
      LV Status              available
      # open                 1
      LV Size                <32.51 GiB
      Current LE             8322
      Segments               1
      Allocation             inherit
      Read ahead sectors     auto
      - currently set to     256
      Block device           252:0
    
      --- Logical volume ---
      LV Path                /dev/vg_main/lv_swap
      LV Name                lv_swap
      VG Name                vg_main
      LV UUID                nOqXSr-q4HV-FofL-WeHm-uAfW-36t0-hOM8Zd
      LV Write Access        read/write
      LV Creation host, time localhost, 2020-04-07 23:22:23 -0400
      LV Status              available
      # open                 2
      LV Size                4.00 GiB
      Current LE             1024
      Segments               1
      Allocation             inherit
      Read ahead sectors     auto
      - currently set to     256
      Block device           252:1
```

`lvextend` - Add space to a logical volume. `lvextend -h` to show command format.     

> Format1: `lvextend LV PV ...` to extend an LV by specified PV extents. In this case, we append physical volume _/dev/sda3_ to logical volume _/dev/vg_main/lv_root_.
```shell
    [root@oracle-12201-vagrant ~]# lvextend -r /dev/vg_main/lv_root /dev/sda3
      Size of logical volume vg_main/lv_root changed from <32.51 GiB (8322 extents) to 95.50 GiB (24449 extents).
      Logical volume vg_main/lv_root successfully resized.
    meta-data=/dev/mapper/vg_main-lv_root isize=256    agcount=4, agsize=2130432 blks
             =                       sectsz=512   attr=2, projid32bit=1
             =                       crc=0        finobt=0 spinodes=0 rmapbt=0
             =                       reflink=0
    data     =                       bsize=4096   blocks=8521728, imaxpct=25
             =                       sunit=0      swidth=0 blks
    naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
    log      =internal               bsize=4096   blocks=4161, version=2
             =                       sectsz=512   sunit=0 blks, lazy-count=1
    realtime =none                   extsz=4096   blocks=0, rtextents=0
    data blocks changed from 8521728 to 25035776
    [root@oracle-12201-vagrant ~]#
```

> Format2: `lvextend -L|--size [+]Size[m|UNIT] LV` to extend an LV by a specified size. In this case, we append all remaining free spaces, in our case physical volume _/dev/sdb1_, to logical volume _/dev/vg_main/lv_root_.    
```shell
    [root@oracle-12201-vagrant ~]# lvextend -r -l +100%FREE /dev/vg_main/lv_root
      Size of logical volume vg_main/lv_root changed from 95.50 GiB (24449 extents) to 111.50 GiB (28544 extents).
      Logical volume vg_main/lv_root successfully resized.
    meta-data=/dev/mapper/vg_main-lv_root isize=256    agcount=12, agsize=2130432 blks
             =                       sectsz=512   attr=2, projid32bit=1
             =                       crc=0        finobt=0 spinodes=0 rmapbt=0
             =                       reflink=0
    data     =                       bsize=4096   blocks=25035776, imaxpct=25
             =                       sunit=0      swidth=0 blks
    naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
    log      =internal               bsize=4096   blocks=4161, version=2
             =                       sectsz=512   sunit=0 blks, lazy-count=1
    realtime =none                   extsz=4096   blocks=0, rtextents=0
    data blocks changed from 25035776 to 29229056
    [root@oracle-12201-vagrant ~]#
```

Check and find the logical volume increased.
```shell
    [root@oracle-12201-vagrant ~]# df -H
    Filesystem                   Size  Used Avail Use% Mounted on
    devtmpfs                     2.0G     0  2.0G   0% /dev
    tmpfs                        2.0G     0  2.0G   0% /dev/shm
    tmpfs                        2.0G  8.9M  2.0G   1% /run
    tmpfs                        2.0G     0  2.0G   0% /sys/fs/cgroup
    /dev/mapper/vg_main-lv_root  120G   16G  105G  14% /
    /dev/sda1                    521M  127M  395M  25% /boot
    vagrant                      1.1T  340G  661G  34% /vagrant
    tmpfs                        386M     0  386M   0% /run/user/1000
    tmpfs                        386M     0  386M   0% /run/user/0
```

6. conclusion: 
 - physical hard disk
 - creating partitions on disk, fdisk command
 - create physical volume (PV) from partition, pvcreate command
 - add physical volume (PV) to volume group, vgextend command
 - allocate free space under volume group to logical volume (LV), lvextend command

7. information query commands:
 - Check all disks information: fdisk -l; parted -l; df -h; lsblk; sfdisk -l -uM
 - Display disk free space information: df -H
 - Display information about physical volumes: pvs
 - Display information about logical volumes: lvdisplay
 - `sudo su -l oracle`: use current user''s password to switch to another user `oracle` but no need to provide password. option `-l` to reset user environment.
     
8. some commands to check hard disk partitions and disk space on Linux
    need root previledge to run them. so first `sudo su - ` to root without prompting to enter root password; or `su -` to root with prompting to enter root password.

 - fdisk
Fdisk is the most commonly used command to check the partitions on a disk. The fdisk command can display the partitions and details like file system type. However it does not report the size of each partitions.
```shell
    [root@oracle-12201-vagrant ~]# fdisk -l
    
    Disk /dev/sda: 107.4 GB, 107374182400 bytes, 209715200 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    Disk label type: dos
    Disk identifier: 0x00087a38
    
       Device Boot      Start         End      Blocks   Id  System
    /dev/sda1   *        2048     1026047      512000   83  Linux
    /dev/sda2         1026048    77594623    38284288   8e  Linux LVM
    /dev/sda3        77594624   209715199    66060288   83  Linux
    
    Disk /dev/sdb: 17.2 GB, 17179869184 bytes, 33554432 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    
    
    Disk /dev/mapper/vg_main-lv_root: 34.9 GB, 34904997888 bytes, 68173824 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    
    
    Disk /dev/mapper/vg_main-lv_swap: 4294 MB, 4294967296 bytes, 8388608 sectors
    Units = sectors of 1 * 512 = 512 bytes
    Sector size (logical/physical): 512 bytes / 512 bytes
    I/O size (minimum/optimal): 512 bytes / 512 bytes
    [root@oracle-12201-vagrant ~]#
```

 - sfdisk
Sfdisk is another utility with a purpose similar to fdisk, but with more features. It can display the size of each partition in MB.
```shell
    [root@oracle-12201-vagrant ~]# sfdisk -l -uM
    
    Disk /dev/sda: 13054 cylinders, 255 heads, 63 sectors/track
    Units: 1MiB = 1024*1024 bytes, blocks of 1024 bytes, counting from 0
    
       Device Boot Start   End    MiB    #blocks   Id  System
    /dev/sda1   *     1    500    500     512000   83  Linux
    /dev/sda2       501  37887  37387   38284288   8e  Linux LVM
    /dev/sda3     37888  102399  64512   66060288   83  Linux
    sfdisk:                 start: (c,h,s) expected (1023,254,63) found (734,10,45)
    
    sfdisk:                 end: (c,h,s) expected (1023,254,63) found (766,42,44)
    
    /dev/sda4         0      -      0          0    0  Empty
    
    Disk /dev/sdb: 2088 cylinders, 255 heads, 63 sectors/track
    
    Disk /dev/mapper/vg_main-lv_root: 4243 cylinders, 255 heads, 63 sectors/track
    
    Disk /dev/mapper/vg_main-lv_swap: 522 cylinders, 255 heads, 63 sectors/track
    [root@oracle-12201-vagrant ~]#
```

 - lsblk
Lists out all the storage blocks, which includes disk partitions and optical drives. Details include the total size of the partition/block and the mount point if any.
Does not report the used/free disk space on the partitions.

If there is no MOUNTPOINT, then it means that the file system is not yet mounted. For cd/dvd this means that there is no disk.
```shell
    [root@oracle-12201-vagrant ~]# lsblk
    NAME                MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
    sdb                   8:16   0   16G  0 disk
    sda                   8:0    0  100G  0 disk
    |-sda2                8:2    0 36.5G  0 part
    |  |-vg_main-lv_swap 252:1    0    4G  0 lvm  [SWAP]
    |  |-vg_main-lv_root 252:0    0 32.5G  0 lvm  /
    |-sda1                8:1    0  500M  0 part /boot
```

 - df
Df is not a partitioning utility, but prints out details about only mounted file systems. The list generated by df even includes file systems that are not real disk partitions.

Note that df shows only the mounted file systems or partitions and not all.
```shell
    [root@oracle-12201-vagrant ~]# df -h
    Filesystem                   Size  Used Avail Use% Mounted on
    devtmpfs                     1.8G     0  1.8G   0% /dev
    tmpfs                        1.8G     0  1.8G   0% /dev/shm
    tmpfs                        1.8G  8.4M  1.8G   1% /run
    tmpfs                        1.8G     0  1.8G   0% /sys/fs/cgroup
    /dev/mapper/vg_main-lv_root   33G   15G   18G  45% /
    /dev/sda1                    497M  121M  377M  25% /boot
    vagrant                      932G  317G  616G  34% /vagrant
    tmpfs                        368M     0  368M   0% /run/user/1000
```

 - parted
Parted is yet another command line utility to list out partitions and modify them if needed.
```shell
    [root@oracle-12201-vagrant ~]# parted -l
    Model: ATA VBOX HARDDISK (scsi)
    Disk /dev/sda: 107GB
    Sector size (logical/physical): 512B/512B
    Partition Table: msdos
    Disk Flags:
    
    Number  Start   End     Size    Type     File system  Flags
     1      1049kB  525MB   524MB   primary  xfs          boot
     2      525MB   39.7GB  39.2GB  primary               lvm
     3      39.7GB  107GB   67.6GB  primary
    
    
    Error: /dev/sdb: unrecognised disk label
    Model: ATA VBOX HARDDISK (scsi)
    Disk /dev/sdb: 17.2GB
    Sector size (logical/physical): 512B/512B
    Partition Table: unknown
    Disk Flags:
    
    Model: Linux device-mapper (linear) (dm)
    Disk /dev/mapper/vg_main-lv_swap: 4295MB
    Sector size (logical/physical): 512B/512B
    Partition Table: loop
    Disk Flags:
    
    Number  Start  End     Size    File system     Flags
     1      0.00B  4295MB  4295MB  linux-swap(v1)
    
    
    Model: Linux device-mapper (linear) (dm)
    Disk /dev/mapper/vg_main-lv_root: 34.9GB
    Sector size (logical/physical): 512B/512B
    Partition Table: loop
    Disk Flags:
    
    Number  Start  End     Size    File system  Flags
     1      0.00B  34.9GB  34.9GB  xfs
```