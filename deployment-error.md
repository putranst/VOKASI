PS C:\Users\PT\Desktop\TSEA-X> .\deploy.ps1
Deploying to Project: tsea-x-platform in Region: us-central1
Enabling necessary APIs...
Operation "operations/acat.p2-178367585998-6caa6235-084c-4345-be17-a532494849ed" finished successfully.
Building and Deploying Backend...
Creating temporary archive of 8301 file(s) totalling 220.8 MiB before compression.
Uploading tarball of [./backend] to [gs://tsea-x-platform_cloudbuild/source/1764530326.206325-a990153d870e4f028505889995cec5a5.tgz]
Created [https://cloudbuild.googleapis.com/v1/projects/tsea-x-platform/locations/global/builds/d0739666-5259-4e56-9b4e-61763b7c0913].
Logs are available at [ https://console.cloud.google.com/cloud-build/builds/d0739666-5259-4e56-9b4e-61763b7c0913?project=178367585998 ].
Waiting for build to complete. Polling interval: 1 second(s).
-------------------------------------------------------- REMOTE BUILD OUTPUT --------------------------------------------------------
starting build "d0739666-5259-4e56-9b4e-61763b7c0913"

FETCHSOURCE
Fetching storage object: gs://tsea-x-platform_cloudbuild/source/1764530326.206325-a990153d870e4f028505889995cec5a5.tgz#1764530427629887
Copying gs://tsea-x-platform_cloudbuild/source/1764530326.206325-a990153d870e4f028505889995cec5a5.tgz#1764530427629887...
- [1 files][ 52.2 MiB/ 52.2 MiB]
Operation completed over 1 objects/52.2 MiB.
BUILD
Already have image (with digest): gcr.io/cloud-builders/gcb-internal
Sending build context to Docker daemon  238.3MB
Step 1/8 : FROM python:3.11-slim
3.11-slim: Pulling from library/python
0e4bc2bd6656: Pulling fs layer
22b63e76fde1: Pulling fs layer
b3dd773c3296: Pulling fs layer
1771569cc129: Pulling fs layer
1771569cc129: Verifying Checksum
1771569cc129: Download complete
22b63e76fde1: Verifying Checksum
22b63e76fde1: Download complete
b3dd773c3296: Verifying Checksum
b3dd773c3296: Download complete
0e4bc2bd6656: Verifying Checksum
0e4bc2bd6656: Download complete
0e4bc2bd6656: Pull complete
22b63e76fde1: Pull complete
b3dd773c3296: Pull complete
1771569cc129: Pull complete
Digest: sha256:193fdd0bbcb3d2ae612bd6cc3548d2f7c78d65b549fcaa8af75624c47474444d
Status: Downloaded newer image for python:3.11-slim
 ---> 040af88f5bce
Step 2/8 : WORKDIR /app
 ---> Running in 7e0b80ee0e01
Removing intermediate container 7e0b80ee0e01
 ---> 95d8c2e8a225
Step 3/8 : RUN apt-get update && apt-get install -y     gcc     && rm -rf /var/lib/apt/lists/*
 ---> Running in b47980271d7d
Hit:1 http://deb.debian.org/debian trixie InRelease
Get:2 http://deb.debian.org/debian trixie-updates InRelease [47.3 kB]
Get:3 http://deb.debian.org/debian-security trixie-security InRelease [43.4 kB]
Get:4 http://deb.debian.org/debian trixie/main amd64 Packages [9670 kB]
Get:5 http://deb.debian.org/debian trixie-updates/main amd64 Packages [5412 B]
Get:6 http://deb.debian.org/debian-security trixie-security/main amd64 Packages [76.0 kB]
Fetched 9842 kB in 1s (7940 kB/s)
Reading package lists...
Reading package lists...
Building dependency tree...
Reading state information...
The following additional packages will be installed:
  binutils binutils-common binutils-x86-64-linux-gnu cpp cpp-14
  cpp-14-x86-64-linux-gnu cpp-x86-64-linux-gnu gcc-14 gcc-14-x86-64-linux-gnu
  gcc-x86-64-linux-gnu libasan8 libatomic1 libbinutils libc-dev-bin libc6-dev
  libcc1-0 libcrypt-dev libctf-nobfd0 libctf0 libgcc-14-dev libgomp1
  libgprofng0 libhwasan0 libisl23 libitm1 libjansson4 liblsan0 libmpc3
  libmpfr6 libquadmath0 libsframe1 libtsan2 libubsan1 linux-libc-dev manpages
  manpages-dev rpcsvc-proto
Suggested packages:
  binutils-doc gprofng-gui binutils-gold cpp-doc gcc-14-locales cpp-14-doc
  gcc-multilib make autoconf automake libtool flex bison gdb gcc-doc
  gcc-14-multilib gcc-14-doc gdb-x86-64-linux-gnu libc-devtools glibc-doc
  man-browser
The following NEW packages will be installed:
  binutils binutils-common binutils-x86-64-linux-gnu cpp cpp-14
  cpp-14-x86-64-linux-gnu cpp-x86-64-linux-gnu gcc gcc-14
  gcc-14-x86-64-linux-gnu gcc-x86-64-linux-gnu libasan8 libatomic1 libbinutils
  libc-dev-bin libc6-dev libcc1-0 libcrypt-dev libctf-nobfd0 libctf0
  libgcc-14-dev libgomp1 libgprofng0 libhwasan0 libisl23 libitm1 libjansson4
  liblsan0 libmpc3 libmpfr6 libquadmath0 libsframe1 libtsan2 libubsan1
  linux-libc-dev manpages manpages-dev rpcsvc-proto
0 upgraded, 38 newly installed, 0 to remove and 0 not upgraded.
Need to get 60.3 MB of archives.
After this operation, 222 MB of additional disk space will be used.
Get:1 http://deb.debian.org/debian trixie/main amd64 manpages all 6.9.1-1 [1393 kB]
Get:2 http://deb.debian.org/debian trixie/main amd64 libsframe1 amd64 2.44-3 [78.4 kB]
Get:3 http://deb.debian.org/debian trixie/main amd64 binutils-common amd64 2.44-3 [2509 kB]
Get:4 http://deb.debian.org/debian trixie/main amd64 libbinutils amd64 2.44-3 [534 kB]
Get:5 http://deb.debian.org/debian trixie/main amd64 libgprofng0 amd64 2.44-3 [808 kB]
Get:6 http://deb.debian.org/debian trixie/main amd64 libctf-nobfd0 amd64 2.44-3 [156 kB]
Get:7 http://deb.debian.org/debian trixie/main amd64 libctf0 amd64 2.44-3 [88.6 kB]
Get:8 http://deb.debian.org/debian trixie/main amd64 libjansson4 amd64 2.14-2+b3 [39.8 kB]
Get:9 http://deb.debian.org/debian trixie/main amd64 binutils-x86-64-linux-gnu amd64 2.44-3 [1014 kB]
Get:10 http://deb.debian.org/debian trixie/main amd64 binutils amd64 2.44-3 [265 kB]
Get:11 http://deb.debian.org/debian trixie/main amd64 libisl23 amd64 0.27-1 [659 kB]
Get:12 http://deb.debian.org/debian trixie/main amd64 libmpfr6 amd64 4.2.2-1 [729 kB]
Get:13 http://deb.debian.org/debian trixie/main amd64 libmpc3 amd64 1.3.1-1+b3 [52.2 kB]
Get:14 http://deb.debian.org/debian trixie/main amd64 cpp-14-x86-64-linux-gnu amd64 14.2.0-19 [11.0 MB]
Get:15 http://deb.debian.org/debian trixie/main amd64 cpp-14 amd64 14.2.0-19 [1280 B]
Get:16 http://deb.debian.org/debian trixie/main amd64 cpp-x86-64-linux-gnu amd64 4:14.2.0-1 [4840 B]
Get:17 http://deb.debian.org/debian trixie/main amd64 cpp amd64 4:14.2.0-1 [1568 B]
Get:18 http://deb.debian.org/debian trixie/main amd64 libcc1-0 amd64 14.2.0-19 [42.8 kB]
Get:19 http://deb.debian.org/debian trixie/main amd64 libgomp1 amd64 14.2.0-19 [137 kB]
Get:20 http://deb.debian.org/debian trixie/main amd64 libitm1 amd64 14.2.0-19 [26.0 kB]
Get:21 http://deb.debian.org/debian trixie/main amd64 libatomic1 amd64 14.2.0-19 [9308 B]
Get:22 http://deb.debian.org/debian trixie/main amd64 libasan8 amd64 14.2.0-19 [2725 kB]
Get:23 http://deb.debian.org/debian trixie/main amd64 liblsan0 amd64 14.2.0-19 [1204 kB]
Get:24 http://deb.debian.org/debian trixie/main amd64 libtsan2 amd64 14.2.0-19 [2460 kB]
Get:25 http://deb.debian.org/debian trixie/main amd64 libubsan1 amd64 14.2.0-19 [1074 kB]
Get:26 http://deb.debian.org/debian trixie/main amd64 libhwasan0 amd64 14.2.0-19 [1488 kB]
Get:27 http://deb.debian.org/debian trixie/main amd64 libquadmath0 amd64 14.2.0-19 [145 kB]
Get:28 http://deb.debian.org/debian trixie/main amd64 libgcc-14-dev amd64 14.2.0-19 [2672 kB]
Get:29 http://deb.debian.org/debian trixie/main amd64 gcc-14-x86-64-linux-gnu amd64 14.2.0-19 [21.4 MB]
Get:30 http://deb.debian.org/debian trixie/main amd64 gcc-14 amd64 14.2.0-19 [540 kB]
Get:31 http://deb.debian.org/debian trixie/main amd64 gcc-x86-64-linux-gnu amd64 4:14.2.0-1 [1436 B]
Get:32 http://deb.debian.org/debian trixie/main amd64 gcc amd64 4:14.2.0-1 [5136 B]
Get:33 http://deb.debian.org/debian trixie/main amd64 libc-dev-bin amd64 2.41-12 [58.2 kB]
Get:34 http://deb.debian.org/debian trixie/main amd64 linux-libc-dev all 6.12.57-1 [2692 kB]
Get:35 http://deb.debian.org/debian trixie/main amd64 libcrypt-dev amd64 1:4.4.38-1 [119 kB]
Get:36 http://deb.debian.org/debian trixie/main amd64 rpcsvc-proto amd64 1.4.3-1 [63.3 kB]
Get:37 http://deb.debian.org/debian trixie/main amd64 libc6-dev amd64 2.41-12 [1991 kB]
Get:38 http://deb.debian.org/debian trixie/main amd64 manpages-dev all 6.9.1-1 [2122 kB]
debconf: unable to initialize frontend: Dialog
debconf: (TERM is not set, so the dialog frontend is not usable.)
debconf: falling back to frontend: Readline
debconf: unable to initialize frontend: Readline
debconf: (Can't locate Term/ReadLine.pm in @INC (you may need to install the Term::ReadLine module) (@INC entries checked: /etc/perl /usr/local/lib/x86_64-linux-gnu/perl/5.40.1 /usr/local/share/perl/5.40.1 /usr/lib/x86_64-linux-gnu/perl5/5.40 /usr/share/perl5 /usr/lib/x86_64-linux-gnu/perl-base /usr/lib/x86_64-linux-gnu/perl/5.40 /usr/share/perl/5.40 /usr/local/lib/site_perl) at /usr/share/perl5/Debconf/FrontEnd/Readline.pm line 8, <STDIN> line 38.)
debconf: falling back to frontend: Teletype
debconf: unable to initialize frontend: Teletype
debconf: (This frontend requires a controlling tty.)
debconf: falling back to frontend: Noninteractive
Fetched 60.3 MB in 1s (111 MB/s)
Selecting previously unselected package manpages.
(Reading database ... 5644 files and directories currently installed.)
Preparing to unpack .../00-manpages_6.9.1-1_all.deb ...
Unpacking manpages (6.9.1-1) ...
Selecting previously unselected package libsframe1:amd64.
Preparing to unpack .../01-libsframe1_2.44-3_amd64.deb ...
Unpacking libsframe1:amd64 (2.44-3) ...
Selecting previously unselected package binutils-common:amd64.
Preparing to unpack .../02-binutils-common_2.44-3_amd64.deb ...
Unpacking binutils-common:amd64 (2.44-3) ...
Selecting previously unselected package libbinutils:amd64.
Preparing to unpack .../03-libbinutils_2.44-3_amd64.deb ...
Unpacking libbinutils:amd64 (2.44-3) ...
Selecting previously unselected package libgprofng0:amd64.
Preparing to unpack .../04-libgprofng0_2.44-3_amd64.deb ...
Unpacking libgprofng0:amd64 (2.44-3) ...
Selecting previously unselected package libctf-nobfd0:amd64.
Preparing to unpack .../05-libctf-nobfd0_2.44-3_amd64.deb ...
Unpacking libctf-nobfd0:amd64 (2.44-3) ...
Selecting previously unselected package libctf0:amd64.
Preparing to unpack .../06-libctf0_2.44-3_amd64.deb ...
Unpacking libctf0:amd64 (2.44-3) ...
Selecting previously unselected package libjansson4:amd64.
Preparing to unpack .../07-libjansson4_2.14-2+b3_amd64.deb ...
Unpacking libjansson4:amd64 (2.14-2+b3) ...
Selecting previously unselected package binutils-x86-64-linux-gnu.
Preparing to unpack .../08-binutils-x86-64-linux-gnu_2.44-3_amd64.deb ...
Unpacking binutils-x86-64-linux-gnu (2.44-3) ...
Selecting previously unselected package binutils.
Preparing to unpack .../09-binutils_2.44-3_amd64.deb ...
Unpacking binutils (2.44-3) ...
Selecting previously unselected package libisl23:amd64.
Preparing to unpack .../10-libisl23_0.27-1_amd64.deb ...
Unpacking libisl23:amd64 (0.27-1) ...
Selecting previously unselected package libmpfr6:amd64.
Preparing to unpack .../11-libmpfr6_4.2.2-1_amd64.deb ...
Unpacking libmpfr6:amd64 (4.2.2-1) ...
Selecting previously unselected package libmpc3:amd64.
Preparing to unpack .../12-libmpc3_1.3.1-1+b3_amd64.deb ...
Unpacking libmpc3:amd64 (1.3.1-1+b3) ...
Selecting previously unselected package cpp-14-x86-64-linux-gnu.
Preparing to unpack .../13-cpp-14-x86-64-linux-gnu_14.2.0-19_amd64.deb ...
Unpacking cpp-14-x86-64-linux-gnu (14.2.0-19) ...
Selecting previously unselected package cpp-14.
Preparing to unpack .../14-cpp-14_14.2.0-19_amd64.deb ...
Unpacking cpp-14 (14.2.0-19) ...
Selecting previously unselected package cpp-x86-64-linux-gnu.
Preparing to unpack .../15-cpp-x86-64-linux-gnu_4%3a14.2.0-1_amd64.deb ...
Unpacking cpp-x86-64-linux-gnu (4:14.2.0-1) ...
Selecting previously unselected package cpp.
Preparing to unpack .../16-cpp_4%3a14.2.0-1_amd64.deb ...
Unpacking cpp (4:14.2.0-1) ...
Selecting previously unselected package libcc1-0:amd64.
Preparing to unpack .../17-libcc1-0_14.2.0-19_amd64.deb ...
Unpacking libcc1-0:amd64 (14.2.0-19) ...
Selecting previously unselected package libgomp1:amd64.
Preparing to unpack .../18-libgomp1_14.2.0-19_amd64.deb ...
Unpacking libgomp1:amd64 (14.2.0-19) ...
Selecting previously unselected package libitm1:amd64.
Preparing to unpack .../19-libitm1_14.2.0-19_amd64.deb ...
Unpacking libitm1:amd64 (14.2.0-19) ...
Selecting previously unselected package libatomic1:amd64.
Preparing to unpack .../20-libatomic1_14.2.0-19_amd64.deb ...
Unpacking libatomic1:amd64 (14.2.0-19) ...
Selecting previously unselected package libasan8:amd64.
Preparing to unpack .../21-libasan8_14.2.0-19_amd64.deb ...
Unpacking libasan8:amd64 (14.2.0-19) ...
Selecting previously unselected package liblsan0:amd64.
Preparing to unpack .../22-liblsan0_14.2.0-19_amd64.deb ...
Unpacking liblsan0:amd64 (14.2.0-19) ...
Selecting previously unselected package libtsan2:amd64.
Preparing to unpack .../23-libtsan2_14.2.0-19_amd64.deb ...
Unpacking libtsan2:amd64 (14.2.0-19) ...
Selecting previously unselected package libubsan1:amd64.
Preparing to unpack .../24-libubsan1_14.2.0-19_amd64.deb ...
Unpacking libubsan1:amd64 (14.2.0-19) ...
Selecting previously unselected package libhwasan0:amd64.
Preparing to unpack .../25-libhwasan0_14.2.0-19_amd64.deb ...
Unpacking libhwasan0:amd64 (14.2.0-19) ...
Selecting previously unselected package libquadmath0:amd64.
Preparing to unpack .../26-libquadmath0_14.2.0-19_amd64.deb ...
Unpacking libquadmath0:amd64 (14.2.0-19) ...
Selecting previously unselected package libgcc-14-dev:amd64.
Preparing to unpack .../27-libgcc-14-dev_14.2.0-19_amd64.deb ...
Unpacking libgcc-14-dev:amd64 (14.2.0-19) ...
Selecting previously unselected package gcc-14-x86-64-linux-gnu.
Preparing to unpack .../28-gcc-14-x86-64-linux-gnu_14.2.0-19_amd64.deb ...
Unpacking gcc-14-x86-64-linux-gnu (14.2.0-19) ...
Selecting previously unselected package gcc-14.
Preparing to unpack .../29-gcc-14_14.2.0-19_amd64.deb ...
Unpacking gcc-14 (14.2.0-19) ...
Selecting previously unselected package gcc-x86-64-linux-gnu.
Preparing to unpack .../30-gcc-x86-64-linux-gnu_4%3a14.2.0-1_amd64.deb ...
Unpacking gcc-x86-64-linux-gnu (4:14.2.0-1) ...
Selecting previously unselected package gcc.
Preparing to unpack .../31-gcc_4%3a14.2.0-1_amd64.deb ...
Unpacking gcc (4:14.2.0-1) ...
Selecting previously unselected package libc-dev-bin.
Preparing to unpack .../32-libc-dev-bin_2.41-12_amd64.deb ...
Unpacking libc-dev-bin (2.41-12) ...
Selecting previously unselected package linux-libc-dev.
Preparing to unpack .../33-linux-libc-dev_6.12.57-1_all.deb ...
Unpacking linux-libc-dev (6.12.57-1) ...
Selecting previously unselected package libcrypt-dev:amd64.
Preparing to unpack .../34-libcrypt-dev_1%3a4.4.38-1_amd64.deb ...
Unpacking libcrypt-dev:amd64 (1:4.4.38-1) ...
Selecting previously unselected package rpcsvc-proto.
Preparing to unpack .../35-rpcsvc-proto_1.4.3-1_amd64.deb ...
Unpacking rpcsvc-proto (1.4.3-1) ...
Selecting previously unselected package libc6-dev:amd64.
Preparing to unpack .../36-libc6-dev_2.41-12_amd64.deb ...
Unpacking libc6-dev:amd64 (2.41-12) ...
Selecting previously unselected package manpages-dev.
Preparing to unpack .../37-manpages-dev_6.9.1-1_all.deb ...
Unpacking manpages-dev (6.9.1-1) ...
Setting up manpages (6.9.1-1) ...
Setting up binutils-common:amd64 (2.44-3) ...
Setting up linux-libc-dev (6.12.57-1) ...
Setting up libctf-nobfd0:amd64 (2.44-3) ...
Setting up libgomp1:amd64 (14.2.0-19) ...
Setting up libsframe1:amd64 (2.44-3) ...
Setting up libjansson4:amd64 (2.14-2+b3) ...
Setting up rpcsvc-proto (1.4.3-1) ...
Setting up libmpfr6:amd64 (4.2.2-1) ...
Setting up libquadmath0:amd64 (14.2.0-19) ...
Setting up libmpc3:amd64 (1.3.1-1+b3) ...
Setting up libatomic1:amd64 (14.2.0-19) ...
Setting up libubsan1:amd64 (14.2.0-19) ...
Setting up libhwasan0:amd64 (14.2.0-19) ...
Setting up libcrypt-dev:amd64 (1:4.4.38-1) ...
Setting up libasan8:amd64 (14.2.0-19) ...
Setting up libtsan2:amd64 (14.2.0-19) ...
Setting up libbinutils:amd64 (2.44-3) ...
Setting up libisl23:amd64 (0.27-1) ...
Setting up libc-dev-bin (2.41-12) ...
Setting up libcc1-0:amd64 (14.2.0-19) ...
Setting up liblsan0:amd64 (14.2.0-19) ...
Setting up libitm1:amd64 (14.2.0-19) ...
Setting up libctf0:amd64 (2.44-3) ...
Setting up manpages-dev (6.9.1-1) ...
Setting up libgprofng0:amd64 (2.44-3) ...
Setting up cpp-14-x86-64-linux-gnu (14.2.0-19) ...
Setting up cpp-14 (14.2.0-19) ...
Setting up libc6-dev:amd64 (2.41-12) ...
Setting up libgcc-14-dev:amd64 (14.2.0-19) ...
Setting up binutils-x86-64-linux-gnu (2.44-3) ...
Setting up cpp-x86-64-linux-gnu (4:14.2.0-1) ...
Setting up binutils (2.44-3) ...
Setting up cpp (4:14.2.0-1) ...
Setting up gcc-14-x86-64-linux-gnu (14.2.0-19) ...
Setting up gcc-x86-64-linux-gnu (4:14.2.0-1) ...
Setting up gcc-14 (14.2.0-19) ...
Setting up gcc (4:14.2.0-1) ...
Processing triggers for libc-bin (2.41-12) ...
Removing intermediate container b47980271d7d
 ---> a77a54d836b4
Step 4/8 : COPY requirements.txt .
 ---> b380948eca38
Step 5/8 : RUN pip install --no-cache-dir -r requirements.txt
 ---> Running in 6a21b50b45c2
Collecting fastapi==0.104.1 (from -r requirements.txt (line 1))
  Downloading fastapi-0.104.1-py3-none-any.whl.metadata (24 kB)
Collecting uvicorn==0.24.0 (from uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading uvicorn-0.24.0-py3-none-any.whl.metadata (6.4 kB)
Collecting pydantic==2.5.0 (from -r requirements.txt (line 3))
  Downloading pydantic-2.5.0-py3-none-any.whl.metadata (174 kB)
     ?????????????????????????????????????? 174.6/174.6 kB 39.8 MB/s eta 0:00:00
Collecting python-dotenv==1.0.0 (from -r requirements.txt (line 4))
  Downloading python_dotenv-1.0.0-py3-none-any.whl.metadata (21 kB)
Collecting openai==1.3.0 (from -r requirements.txt (line 5))
  Downloading openai-1.3.0-py3-none-any.whl.metadata (16 kB)
Collecting google-generativeai==0.3.1 (from -r requirements.txt (line 6))
  Downloading google_generativeai-0.3.1-py3-none-any.whl.metadata (5.9 kB)
Collecting httpx==0.25.1 (from -r requirements.txt (line 7))
  Downloading httpx-0.25.1-py3-none-any.whl.metadata (7.1 kB)
Collecting python-multipart==0.0.6 (from -r requirements.txt (line 8))
  Downloading python_multipart-0.0.6-py3-none-any.whl.metadata (2.5 kB)
Collecting anyio<4.0.0,>=3.7.1 (from fastapi==0.104.1->-r requirements.txt (line 1))
  Downloading anyio-3.7.1-py3-none-any.whl.metadata (4.7 kB)
Collecting starlette<0.28.0,>=0.27.0 (from fastapi==0.104.1->-r requirements.txt (line 1))
  Downloading starlette-0.27.0-py3-none-any.whl.metadata (5.8 kB)
Collecting typing-extensions>=4.8.0 (from fastapi==0.104.1->-r requirements.txt (line 1))
  Downloading typing_extensions-4.15.0-py3-none-any.whl.metadata (3.3 kB)
Collecting click>=7.0 (from uvicorn==0.24.0->uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading click-8.3.1-py3-none-any.whl.metadata (2.6 kB)
Collecting h11>=0.8 (from uvicorn==0.24.0->uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading h11-0.16.0-py3-none-any.whl.metadata (8.3 kB)
Collecting annotated-types>=0.4.0 (from pydantic==2.5.0->-r requirements.txt (line 3))
  Downloading annotated_types-0.7.0-py3-none-any.whl.metadata (15 kB)
Collecting pydantic-core==2.14.1 (from pydantic==2.5.0->-r requirements.txt (line 3))
  Downloading pydantic_core-2.14.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.5 kB)
Collecting distro<2,>=1.7.0 (from openai==1.3.0->-r requirements.txt (line 5))
  Downloading distro-1.9.0-py3-none-any.whl.metadata (6.8 kB)
Collecting tqdm>4 (from openai==1.3.0->-r requirements.txt (line 5))
  Downloading tqdm-4.67.1-py3-none-any.whl.metadata (57 kB)
     ??????????????????????????????????????? 57.7/57.7 kB 207.2 MB/s eta 0:00:00
Collecting google-ai-generativelanguage==0.4.0 (from google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading google_ai_generativelanguage-0.4.0-py3-none-any.whl.metadata (5.1 kB)
Collecting google-auth (from google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading google_auth-2.43.0-py2.py3-none-any.whl.metadata (6.6 kB)
Collecting google-api-core (from google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading google_api_core-2.28.1-py3-none-any.whl.metadata (3.3 kB)
Collecting protobuf (from google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading protobuf-6.33.1-cp39-abi3-manylinux2014_x86_64.whl.metadata (593 bytes)
Collecting certifi (from httpx==0.25.1->-r requirements.txt (line 7))
  Downloading certifi-2025.11.12-py3-none-any.whl.metadata (2.5 kB)
Collecting httpcore (from httpx==0.25.1->-r requirements.txt (line 7))
  Downloading httpcore-1.0.9-py3-none-any.whl.metadata (21 kB)
Collecting idna (from httpx==0.25.1->-r requirements.txt (line 7))
  Downloading idna-3.11-py3-none-any.whl.metadata (8.4 kB)
Collecting sniffio (from httpx==0.25.1->-r requirements.txt (line 7))
  Downloading sniffio-1.3.1-py3-none-any.whl.metadata (3.9 kB)
Collecting httptools>=0.5.0 (from uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading httptools-0.7.1-cp311-cp311-manylinux1_x86_64.manylinux_2_28_x86_64.manylinux_2_5_x86_64.whl.metadata (3.5 kB)
Collecting pyyaml>=5.1 (from uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading pyyaml-6.0.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (2.4 kB)
Collecting uvloop!=0.15.0,!=0.15.1,>=0.14.0 (from uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading uvloop-0.22.1-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (4.9 kB)
Collecting watchfiles>=0.13 (from uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading watchfiles-1.1.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (4.9 kB)
Collecting websockets>=10.4 (from uvicorn[standard]==0.24.0->-r requirements.txt (line 2))
  Downloading websockets-15.0.1-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (6.8 kB)
Collecting proto-plus<2.0.0dev,>=1.22.3 (from google-ai-generativelanguage==0.4.0->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading proto_plus-1.26.1-py3-none-any.whl.metadata (2.2 kB)
Collecting protobuf (from google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading protobuf-4.25.8-cp37-abi3-manylinux2014_x86_64.whl.metadata (541 bytes)
Collecting googleapis-common-protos<2.0.0,>=1.56.2 (from google-api-core->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading googleapis_common_protos-1.72.0-py3-none-any.whl.metadata (9.4 kB)
Collecting requests<3.0.0,>=2.18.0 (from google-api-core->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading requests-2.32.5-py3-none-any.whl.metadata (4.9 kB)
Collecting cachetools<7.0,>=2.0.0 (from google-auth->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading cachetools-6.2.2-py3-none-any.whl.metadata (5.6 kB)
Collecting pyasn1-modules>=0.2.1 (from google-auth->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading pyasn1_modules-0.4.2-py3-none-any.whl.metadata (3.5 kB)
Collecting rsa<5,>=3.1.4 (from google-auth->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading rsa-4.9.1-py3-none-any.whl.metadata (5.6 kB)
Collecting grpcio<2.0.0,>=1.33.2 (from google-api-core[grpc]!=2.0.*,!=2.1.*,!=2.10.*,!=2.2.*,!=2.3.*,!=2.4.*,!=2.5.*,!=2.6.*,!=2.7.*,!=2.8.*,!=2.9.*,<3.0.0dev,>=1.34.0->google-ai-generativelanguage==0.4.0->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading grpcio-1.76.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl.metadata (3.7 kB)
Collecting grpcio-status<2.0.0,>=1.33.2 (from google-api-core[grpc]!=2.0.*,!=2.1.*,!=2.10.*,!=2.2.*,!=2.3.*,!=2.4.*,!=2.5.*,!=2.6.*,!=2.7.*,!=2.8.*,!=2.9.*,<3.0.0dev,>=1.34.0->google-ai-generativelanguage==0.4.0->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading grpcio_status-1.76.0-py3-none-any.whl.metadata (1.1 kB)
Collecting pyasn1<0.7.0,>=0.6.1 (from pyasn1-modules>=0.2.1->google-auth->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading pyasn1-0.6.1-py3-none-any.whl.metadata (8.4 kB)
Collecting charset_normalizer<4,>=2 (from requests<3.0.0,>=2.18.0->google-api-core->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading charset_normalizer-3.4.4-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl.metadata (37 kB)
Collecting urllib3<3,>=1.21.1 (from requests<3.0.0,>=2.18.0->google-api-core->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading urllib3-2.5.0-py3-none-any.whl.metadata (6.5 kB)
INFO: pip is looking at multiple versions of grpcio-status to determine which version is compatible with other requirements. This could take a while.
Collecting grpcio-status<2.0.0,>=1.33.2 (from google-api-core[grpc]!=2.0.*,!=2.1.*,!=2.10.*,!=2.2.*,!=2.3.*,!=2.4.*,!=2.5.*,!=2.6.*,!=2.7.*,!=2.8.*,!=2.9.*,<3.0.0dev,>=1.34.0->google-ai-generativelanguage==0.4.0->google-generativeai==0.3.1->-r requirements.txt (line 6))
  Downloading grpcio_status-1.75.1-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.75.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.74.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.73.1-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.73.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.72.2-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.72.1-py3-none-any.whl.metadata (1.1 kB)
INFO: pip is still looking at multiple versions of grpcio-status to determine which version is compatible with other requirements. This could take a while.
  Downloading grpcio_status-1.71.2-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.71.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.70.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.69.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.68.1-py3-none-any.whl.metadata (1.1 kB)
INFO: This is taking longer than usual. You might need to provide the dependency resolver with stricter constraints to reduce runtime. See https://pip.pypa.io/warnings/backtracking for guidance. If you want to abort this run, press Ctrl + C.
  Downloading grpcio_status-1.68.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.67.1-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.67.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.66.2-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.66.1-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.66.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.65.5-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.65.4-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.65.2-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.65.1-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.64.3-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.64.1-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.64.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.63.2-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.63.0-py3-none-any.whl.metadata (1.1 kB)
  Downloading grpcio_status-1.62.3-py3-none-any.whl.metadata (1.3 kB)
Downloading fastapi-0.104.1-py3-none-any.whl (92 kB)
   ???????????????????????????????????????? 92.9/92.9 kB 247.8 MB/s eta 0:00:00
Downloading uvicorn-0.24.0-py3-none-any.whl (59 kB)
   ???????????????????????????????????????? 59.6/59.6 kB 229.2 MB/s eta 0:00:00
Downloading pydantic-2.5.0-py3-none-any.whl (407 kB)
   ???????????????????????????????????????? 407.5/407.5 kB 87.9 MB/s eta 0:00:00
Downloading python_dotenv-1.0.0-py3-none-any.whl (19 kB)
Downloading openai-1.3.0-py3-none-any.whl (220 kB)
   ??????????????????????????????????????? 220.3/220.3 kB 280.9 MB/s eta 0:00:00
Downloading google_generativeai-0.3.1-py3-none-any.whl (146 kB)
   ??????????????????????????????????????? 146.6/146.6 kB 271.3 MB/s eta 0:00:00
Downloading httpx-0.25.1-py3-none-any.whl (75 kB)
   ???????????????????????????????????????? 75.0/75.0 kB 248.5 MB/s eta 0:00:00
Downloading python_multipart-0.0.6-py3-none-any.whl (45 kB)
   ???????????????????????????????????????? 45.7/45.7 kB 212.5 MB/s eta 0:00:00
Downloading google_ai_generativelanguage-0.4.0-py3-none-any.whl (598 kB)
   ??????????????????????????????????????? 598.7/598.7 kB 125.7 MB/s eta 0:00:00
Downloading pydantic_core-2.14.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (2.1 MB)
   ???????????????????????????????????????? 2.1/2.1 MB 123.5 MB/s eta 0:00:00
Downloading annotated_types-0.7.0-py3-none-any.whl (13 kB)
Downloading anyio-3.7.1-py3-none-any.whl (80 kB)
   ???????????????????????????????????????? 80.9/80.9 kB 246.2 MB/s eta 0:00:00
Downloading click-8.3.1-py3-none-any.whl (108 kB)
   ??????????????????????????????????????? 108.3/108.3 kB 248.1 MB/s eta 0:00:00
Downloading distro-1.9.0-py3-none-any.whl (20 kB)
Downloading google_api_core-2.28.1-py3-none-any.whl (173 kB)
   ??????????????????????????????????????? 173.7/173.7 kB 283.4 MB/s eta 0:00:00
Downloading google_auth-2.43.0-py2.py3-none-any.whl (223 kB)
   ??????????????????????????????????????? 223.1/223.1 kB 281.2 MB/s eta 0:00:00
Downloading h11-0.16.0-py3-none-any.whl (37 kB)
Downloading httptools-0.7.1-cp311-cp311-manylinux1_x86_64.manylinux_2_28_x86_64.manylinux_2_5_x86_64.whl (456 kB)
   ??????????????????????????????????????? 456.6/456.6 kB 200.5 MB/s eta 0:00:00
Downloading idna-3.11-py3-none-any.whl (71 kB)
   ???????????????????????????????????????? 71.0/71.0 kB 110.7 MB/s eta 0:00:00
Downloading protobuf-4.25.8-cp37-abi3-manylinux2014_x86_64.whl (294 kB)
   ??????????????????????????????????????? 294.9/294.9 kB 174.2 MB/s eta 0:00:00
Downloading pyyaml-6.0.3-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (806 kB)
   ??????????????????????????????????????? 806.6/806.6 kB 161.4 MB/s eta 0:00:00
Downloading sniffio-1.3.1-py3-none-any.whl (10 kB)
Downloading starlette-0.27.0-py3-none-any.whl (66 kB)
   ???????????????????????????????????????? 67.0/67.0 kB 231.6 MB/s eta 0:00:00
Downloading tqdm-4.67.1-py3-none-any.whl (78 kB)
   ???????????????????????????????????????? 78.5/78.5 kB 246.6 MB/s eta 0:00:00
Downloading typing_extensions-4.15.0-py3-none-any.whl (44 kB)
   ???????????????????????????????????????? 44.6/44.6 kB 211.4 MB/s eta 0:00:00
Downloading uvloop-0.22.1-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (3.8 MB)
   ???????????????????????????????????????? 3.8/3.8 MB 93.1 MB/s eta 0:00:00
Downloading watchfiles-1.1.1-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (456 kB)
   ??????????????????????????????????????? 456.1/456.1 kB 119.8 MB/s eta 0:00:00
Downloading websockets-15.0.1-cp311-cp311-manylinux_2_5_x86_64.manylinux1_x86_64.manylinux_2_17_x86_64.manylinux2014_x86_64.whl (182 kB)
   ??????????????????????????????????????? 182.3/182.3 kB 286.0 MB/s eta 0:00:00
Downloading certifi-2025.11.12-py3-none-any.whl (159 kB)
   ??????????????????????????????????????? 159.4/159.4 kB 206.8 MB/s eta 0:00:00
Downloading httpcore-1.0.9-py3-none-any.whl (78 kB)
   ???????????????????????????????????????? 78.8/78.8 kB 241.1 MB/s eta 0:00:00
Downloading cachetools-6.2.2-py3-none-any.whl (11 kB)
Downloading googleapis_common_protos-1.72.0-py3-none-any.whl (297 kB)
   ??????????????????????????????????????? 297.5/297.5 kB 233.3 MB/s eta 0:00:00
Downloading proto_plus-1.26.1-py3-none-any.whl (50 kB)
   ???????????????????????????????????????? 50.2/50.2 kB 227.6 MB/s eta 0:00:00
Downloading pyasn1_modules-0.4.2-py3-none-any.whl (181 kB)
   ??????????????????????????????????????? 181.3/181.3 kB 274.7 MB/s eta 0:00:00
Downloading requests-2.32.5-py3-none-any.whl (64 kB)
   ???????????????????????????????????????? 64.7/64.7 kB 216.5 MB/s eta 0:00:00
Downloading rsa-4.9.1-py3-none-any.whl (34 kB)
Downloading charset_normalizer-3.4.4-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (151 kB)
   ??????????????????????????????????????? 151.6/151.6 kB 280.7 MB/s eta 0:00:00
Downloading grpcio-1.76.0-cp311-cp311-manylinux2014_x86_64.manylinux_2_17_x86_64.whl (6.6 MB)
   ???????????????????????????????????????? 6.6/6.6 MB 215.8 MB/s eta 0:00:00
Downloading grpcio_status-1.62.3-py3-none-any.whl (14 kB)
Downloading pyasn1-0.6.1-py3-none-any.whl (83 kB)
   ???????????????????????????????????????? 83.1/83.1 kB 242.2 MB/s eta 0:00:00
Downloading urllib3-2.5.0-py3-none-any.whl (129 kB)
   ??????????????????????????????????????? 129.8/129.8 kB 259.4 MB/s eta 0:00:00
Installing collected packages: websockets, uvloop, urllib3, typing-extensions, tqdm, sniffio, pyyaml, python-multipart, python-dotenv, pyasn1, protobuf, idna, httptools, h11, distro, click, charset_normalizer, certifi, cachetools, annotated-types, uvicorn, rsa, requests, pydantic-core, pyasn1-modules, proto-plus, httpcore, grpcio, googleapis-common-protos, anyio, watchfiles, starlette, pydantic, httpx, grpcio-status, google-auth, openai, google-api-core, fastapi, google-ai-generativelanguage, google-generativeai
Successfully installed annotated-types-0.7.0 anyio-3.7.1 cachetools-6.2.2 certifi-2025.11.12 charset_normalizer-3.4.4 click-8.3.1 distro-1.9.0 fastapi-0.104.1 google-ai-generativelanguage-0.4.0 google-api-core-2.28.1 google-auth-2.43.0 google-generativeai-0.3.1 googleapis-common-protos-1.72.0 grpcio-1.76.0 grpcio-status-1.62.3 h11-0.16.0 httpcore-1.0.9 httptools-0.7.1 httpx-0.25.1 idna-3.11 openai-1.3.0 proto-plus-1.26.1 protobuf-4.25.8 pyasn1-0.6.1 pyasn1-modules-0.4.2 pydantic-2.5.0 pydantic-core-2.14.1 python-dotenv-1.0.0 python-multipart-0.0.6 pyyaml-6.0.3 requests-2.32.5 rsa-4.9.1 sniffio-1.3.1 starlette-0.27.0 tqdm-4.67.1 typing-extensions-4.15.0 urllib3-2.5.0 uvicorn-0.24.0 uvloop-0.22.1 watchfiles-1.1.1 websockets-15.0.1
WARNING: Running pip as the 'root' user can result in broken permissions and conflicting behaviour with the system package manager. It is recommended to use a virtual environment instead: https://pip.pypa.io/warnings/venv

[notice] A new release of pip is available: 24.0 -> 25.3
[notice] To update, run: pip install --upgrade pip
Removing intermediate container 6a21b50b45c2
 ---> 7f2dc2ba783e
Step 6/8 : COPY . .
 ---> 2510a03627e7
Step 7/8 : EXPOSE 8000
 ---> Running in 0d6bcce4df57
Removing intermediate container 0d6bcce4df57
 ---> df54e841382a
Step 8/8 : CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
 ---> Running in 07f694e3c03f
Removing intermediate container 07f694e3c03f
 ---> 0e07792e4e1c
Successfully built 0e07792e4e1c
Successfully tagged gcr.io/tsea-x-platform/tsea-x-backend:latest
PUSH
Pushing gcr.io/tsea-x-platform/tsea-x-backend
The push refers to repository [gcr.io/tsea-x-platform/tsea-x-backend]
dac01ce9e7ba: Preparing
3893721516aa: Preparing
2fd5aeca00ee: Preparing
b9fa4d084849: Preparing
c0dead3c652e: Preparing
720ee7aae3ad: Preparing
655ff69eb9c8: Preparing
5c988eaa8862: Preparing
70a290c5e58b: Preparing
655ff69eb9c8: Layer already exists
70a290c5e58b: Layer already exists
5c988eaa8862: Layer already exists
720ee7aae3ad: Layer already exists
2fd5aeca00ee: Pushed
c0dead3c652e: Pushed
3893721516aa: Pushed
b9fa4d084849: Pushed
dac01ce9e7ba: Pushed
latest: digest: sha256:ecc7b58ce1e9c014d5bb3ce1e4804ed02311cc6e8de6a96b21fc6333656e7fb5 size: 2209
DONE
-------------------------------------------------------------------------------------------------------------------------------------
ID                                    CREATE_TIME                DURATION  SOURCE                                                                                         IMAGES                                           STATUS
d0739666-5259-4e56-9b4e-61763b7c0913  2025-11-30T19:20:29+00:00  1M24S     gs://tsea-x-platform_cloudbuild/source/1764530326.206325-a990153d870e4f028505889995cec5a5.tgz  gcr.io/tsea-x-platform/tsea-x-backend (+1 more)  SUCCESS
Deploying Backend Service...
Deploying container to Cloud Run service [tsea-x-backend] in project [tsea-x-platform] region [us-central1]
X  Deploying... Done.
  OK Creating Revision...
  OK Routing traffic...
     Setting IAM Policy...
Completed with warnings:
  Setting IAM policy failed, try "gcloud beta run services add-iam-policy-binding --region=us-central1 --member=allUsers --role=roles/run.invoker tsea-x-backend"
Service [tsea-x-backend] revision [tsea-x-backend-00011-sqq] has been deployed and is serving 100 percent of traffic.
Service URL: https://tsea-x-backend-178367585998.us-central1.run.app
Backend deployed at: https://tsea-x-backend-4rphd7arrq-uc.a.run.app
Building and Deploying Frontend...
Creating temporary archive of 80 file(s) totalling 988.9 KiB before compression.
Some files were not included in the source upload.

Check the gcloud log [C:\Users\PT\AppData\Roaming\gcloud\logs\2025.12.01\03.22.39.750923.log] to see which files and the contents of the
default gcloudignore file used (see `$ gcloud topic gcloudignore` to learn
more).

Uploading tarball of [./frontend] to [gs://tsea-x-platform_cloudbuild/source/1764530560.115786-362378aac09247ab90a7a1f5bcc62895.tgz]
Created [https://cloudbuild.googleapis.com/v1/projects/tsea-x-platform/locations/global/builds/5f6d4515-2d9a-44fb-8114-93f189f3d0fc].
Logs are available at [ https://console.cloud.google.com/cloud-build/builds/5f6d4515-2d9a-44fb-8114-93f189f3d0fc?project=178367585998 ].
Waiting for build to complete. Polling interval: 1 second(s).
-------------------------------------------------------- REMOTE BUILD OUTPUT --------------------------------------------------------
starting build "5f6d4515-2d9a-44fb-8114-93f189f3d0fc"

FETCHSOURCE
Fetching storage object: gs://tsea-x-platform_cloudbuild/source/1764530560.115786-362378aac09247ab90a7a1f5bcc62895.tgz#1764530561987575
Copying gs://tsea-x-platform_cloudbuild/source/1764530560.115786-362378aac09247ab90a7a1f5bcc62895.tgz#1764530561987575...
/ [1 files][228.1 KiB/228.1 KiB]
Operation completed over 1 objects/228.1 KiB.
BUILD
Already have image (with digest): gcr.io/cloud-builders/gcb-internal
Sending build context to Docker daemon  1.087MB
Step 1/28 : FROM node:20-alpine AS base
20-alpine: Pulling from library/node
2d35ebdb57d9: Already exists
537c6f956080: Pulling fs layer
d31fb19c9d76: Pulling fs layer
d4cda882e05a: Pulling fs layer
d4cda882e05a: Verifying Checksum
d4cda882e05a: Download complete
d31fb19c9d76: Verifying Checksum
d31fb19c9d76: Download complete
537c6f956080: Verifying Checksum
537c6f956080: Download complete
537c6f956080: Pull complete
d31fb19c9d76: Pull complete
d4cda882e05a: Pull complete
Digest: sha256:16858294071a56ffd4cce9f17b57136cc39e41507b40e245b4f8e906f7a19463
Status: Downloaded newer image for node:20-alpine
 ---> 6fd15b1a333d
Step 2/28 : FROM base AS deps
 ---> 6fd15b1a333d
Step 3/28 : RUN apk add --no-cache libc6-compat
 ---> Running in 7f54f5dff59e
fetch https://dl-cdn.alpinelinux.org/alpine/v3.22/main/x86_64/APKINDEX.tar.gz
fetch https://dl-cdn.alpinelinux.org/alpine/v3.22/community/x86_64/APKINDEX.tar.gz
(1/3) Installing musl-obstack (1.2.3-r2)
(2/3) Installing libucontext (1.3.2-r0)
(3/3) Installing gcompat (1.1.0-r4)
OK: 10 MiB in 21 packages
Removing intermediate container 7f54f5dff59e
 ---> 280d9d6ea165
Step 4/28 : WORKDIR /app
 ---> Running in 1a921ef8775c
Removing intermediate container 1a921ef8775c
 ---> 61cc69a93310
Step 5/28 : COPY package.json package-lock.json* ./
 ---> 86aa1618fd4f
Step 6/28 : RUN npm ci
 ---> Running in 45c96eb71d0f

added 376 packages, and audited 377 packages in 20s

146 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
npm notice
npm notice New major version of npm available! 10.8.2 -> 11.6.4
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.4
npm notice To update run: npm install -g npm@11.6.4
npm notice
Removing intermediate container 45c96eb71d0f
 ---> 39ed164af670
Step 7/28 : FROM base AS builder
 ---> 6fd15b1a333d
Step 8/28 : WORKDIR /app
 ---> Running in 5ea2dc6de8e7
Removing intermediate container 5ea2dc6de8e7
 ---> c712c167c9f1
Step 9/28 : COPY --from=deps /app/node_modules ./node_modules
 ---> 34c395e9bfc8
Step 10/28 : COPY . .
 ---> e7131bf9db92
Step 11/28 : ENV NEXT_TELEMETRY_DISABLED 1
 ---> Running in a66ba0c011a5
Removing intermediate container a66ba0c011a5
 ---> c79ac5af19a5
Step 12/28 : RUN npm run build
 ---> Running in 79bbcb715535

> frontend@0.1.0 build
> next build

[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
   ? Next.js 16.0.3 (Turbopack)

   Creating an optimized production build ...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
 ? Compiled successfully in 29.2s
   Running TypeScript ...
   Collecting page data using 1 worker ...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
   Generating static pages using 1 worker (0/21) ...
[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
   Generating static pages using 1 worker (5/21)
   Generating static pages using 1 worker (10/21)
   Generating static pages using 1 worker (15/21)
 ? Generating static pages using 1 worker (21/21) in 1602.1ms
   Finalizing page optimization ...

Route (app)
? ? /
? ? /_not-found
? ? /admin
? ? /courses
? ? /courses/[id]
? ? /courses/[id]/conceive
? ? /courses/[id]/design
? ? /courses/[id]/implement
? ? /courses/[id]/learn
? ? /courses/[id]/operate
? ? /dashboard
? ? /enterprise
? ? /government
? ? /hexahelix
? ? /institution-dashboard
? ? /instructor-dashboard
? ? /instructor-dashboard/create-course
? ? /instructor-dashboard/grading
? ? /instructor-dashboard/grading/review
? ? /instructor-dashboard/profile
? ? /instructor-dashboard/students
? ? /login
? ? /partners
? ? /partners/[id]
? ? /pathways
? ? /verify-credential


?  (Static)   prerendered as static content
?  (Dynamic)  server-rendered on demand

npm notice
npm notice New major version of npm available! 10.8.2 -> 11.6.4
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.6.4
npm notice To update run: npm install -g npm@11.6.4
npm notice
Removing intermediate container 79bbcb715535
 ---> 1536f783eda0
Step 13/28 : FROM base AS runner
 ---> 6fd15b1a333d
Step 14/28 : WORKDIR /app
 ---> Running in efa130a63bc6
Removing intermediate container efa130a63bc6
 ---> e2a9de612b16
Step 15/28 : ENV NODE_ENV production
 ---> Running in 263c395d64d2
Removing intermediate container 263c395d64d2
 ---> 72ad8ef83de8
Step 16/28 : ENV NEXT_TELEMETRY_DISABLED 1
 ---> Running in 687c895cb17d
Removing intermediate container 687c895cb17d
 ---> e7ab2d997534
Step 17/28 : RUN addgroup --system --gid 1001 nodejs
 ---> Running in acb872e34536
Removing intermediate container acb872e34536
 ---> 6c8baccafc8b
Step 18/28 : RUN adduser --system --uid 1001 nextjs
 ---> Running in 644662c652e7
Removing intermediate container 644662c652e7
 ---> dd43061923c8
Step 19/28 : COPY --from=builder /app/public ./public
 ---> fc76c11a8881
Step 20/28 : RUN mkdir .next
 ---> Running in 6668cd54b5ea
Removing intermediate container 6668cd54b5ea
 ---> 6f174eca0201
Step 21/28 : RUN chown nextjs:nodejs .next
 ---> Running in b17710a9284d
Removing intermediate container b17710a9284d
 ---> c1e2ab03927c
Step 22/28 : COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
 ---> b00e87abd3ef
Step 23/28 : COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
 ---> 038745da82a9
Step 24/28 : USER nextjs
 ---> Running in 12aeb09303d0
Removing intermediate container 12aeb09303d0
 ---> 410b5339de71
Step 25/28 : EXPOSE 3000
 ---> Running in fdc56dca9c55
Removing intermediate container fdc56dca9c55
 ---> c591067b79c5
Step 26/28 : ENV PORT 3000
 ---> Running in 80ee5d20b28e
Removing intermediate container 80ee5d20b28e
 ---> 7112fe6bb334
Step 27/28 : ENV HOSTNAME "0.0.0.0"
 ---> Running in dde1d6715639
Removing intermediate container dde1d6715639
 ---> ad5047adcb9b
Step 28/28 : CMD ["node", "server.js"]
 ---> Running in 1435a1f9c629
Removing intermediate container 1435a1f9c629
 ---> fd4a2aded8eb
Successfully built fd4a2aded8eb
Successfully tagged gcr.io/tsea-x-platform/tsea-x-frontend:latest
PUSH
Pushing gcr.io/tsea-x-platform/tsea-x-frontend
The push refers to repository [gcr.io/tsea-x-platform/tsea-x-frontend]
0ff87be7e2ba: Preparing
45e1a9cd4039: Preparing
aa87f8d516f1: Preparing
b6b5a732f045: Preparing
d295db921f8a: Preparing
55fb7d3d7bc0: Preparing
2869bee4ce58: Preparing
ec9e75d3ed76: Preparing
b0643b6f6505: Preparing
fbeab92e8a42: Preparing
6acabb04a1c3: Preparing
256f393e029f: Preparing
6acabb04a1c3: Waiting
256f393e029f: Waiting
d295db921f8a: Pushed
fbeab92e8a42: Layer already exists
2869bee4ce58: Pushed
b0643b6f6505: Layer already exists
0ff87be7e2ba: Pushed
aa87f8d516f1: Pushed
b6b5a732f045: Pushed
55fb7d3d7bc0: Pushed
ec9e75d3ed76: Pushed
256f393e029f: Layer already exists
6acabb04a1c3: Layer already exists
45e1a9cd4039: Pushed
latest: digest: sha256:91d929aa5a8592597e8fc291af8e50d90d59de831e9f972e4e2fd145bcf6c893 size: 2826
DONE
-------------------------------------------------------------------------------------------------------------------------------------
ID                                    CREATE_TIME                DURATION  SOURCE                                                                                         IMAGES                                            STATUS
5f6d4515-2d9a-44fb-8114-93f189f3d0fc  2025-11-30T19:22:42+00:00  2M22S     gs://tsea-x-platform_cloudbuild/source/1764530560.115786-362378aac09247ab90a7a1f5bcc62895.tgz  gcr.io/tsea-x-platform/tsea-x-frontend (+1 more)  SUCCESS
Deploying Frontend Service...
Deploying container to Cloud Run service [tsea-x-frontend] in project [tsea-x-platform] region [us-central1]
X  Deploying... Done.
  OK Creating Revision...
  OK Routing traffic...
     Setting IAM Policy...
Completed with warnings:
  Setting IAM policy failed, try "gcloud beta run services add-iam-policy-binding --region=us-central1 --member=allUsers --role=roles/run.invoker tsea-x-frontend"
Service [tsea-x-frontend] revision [tsea-x-frontend-00011-j8z] has been deployed and is serving 100 percent of traffic.
Service URL: https://tsea-x-frontend-178367585998.us-central1.run.app

Deployment Complete!
Frontend: https://tsea-x-frontend-4rphd7arrq-uc.a.run.app
Backend:  https://tsea-x-backend-4rphd7arrq-uc.a.run.app