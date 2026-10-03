---
doc_type: scientific_content
course_id: operating_systems
chapter: 18
chapter_id: operating_systems_ch18
chapter_title: Chapter 18
textbook: "Operating System Concepts (Silberschatz, Galvin, Gagne)"
textbook_edition: "10th"
language: en
syllabus_applied: false
sources:
  - {role: book, file: "Abraham-Silberschatz-Operating-System-Concepts-10th-2018-838-870.pdf", pages: "TBD"}
  - {role: slides, file: "ch18.pptx", slides: "1-51"}
assets_dir: assets
asset_counts: {\
spec_version: "1.0"
generated_at: "2026-09-30T00:00:00Z"
status: complete
---

# Chapter 18

> id: ch18-intro | src: book introduction; slides 1-3 | kind: concept

C H A P T E R
Virtual Machines
The term virtualization has many meanings, and aspects of virtualization
permeate all aspects of computing. Virtual machines are one instance of this
trend. Generally, with a virtual machine, guest operating systems and applica-
tions run in an environment that appears to them to be native hardware and
that behaves toward them as native hardware would but that also protects,
manages, and limits them.
This chapter delves into the uses, features, and implementation of virtual
machines. Virtual machines can be implemented in several ways, and this
chapter describes these options. One option is to add virtual machine support
to the kernel. Because that implementation method is the most pertinent to this
book, we explore it most fully. Additionally, hardware features provided by the
CPU and even by I/O devices can support virtual machine implementation, so
we discuss how those features are used by the appropriate kernel modules.
CHAPTER OBJECTIVES
• Explore the history and benefits of virtual machines.
• Discuss the various virtual machine technologies.
• Describe the methods used to implement virtualization.
• Identify the most common hardware features that support virtualization and
explain how they are used by operating-system modules.
• Discuss current virtualization research areas.


**Chapter 18:  Virtual Machines**



**Chapter 18: Virtual Machines**

- Overview
- History
- Benefits and Features
- Building Blocks
- Types of Virtual Machines and Their Implementations
- Virtualization and Operating-System Components
- Examples


**Chapter Objectives**

- Explore the history and benefits of virtual machines
- Discuss the various virtual machine technologies
- Describe the methods used to implement virtualization
- Show the most common hardware features that support virtualization and explain how they are used by operating-system modules
- Discuss current virtualization research areas


## 18.1 Overview
> id: ch18-18-1 | src: book 18.1; slides 4-8 | kind: concept

The fundamental idea behind a virtual machine is to abstract the hardware
of a single computer (the CPU, memory, disk drives, network interface cards,
and so forth) into several different execution environments, thereby creating
the illusion that each separate environment is running on its own private
computer. This concept may seem similar to the layered approach of operating
system implementation (see Section 2.8.2), and in some ways it is. In the case of
Virtual Machines
virtualization, there is a layer that creates a virtual system on which operating
systems or applications can run.
Virtual machine implementations involve several components. At the base
is the host, the underlying hardware system that runs the virtual machines.
The virtual machine manager (VMM) (also known as a hypervisor) creates
and runs virtual machines by providing an interface that is identical to the host
(except in the case of paravirtualization, discussed later). Each guest process is
provided with a virtual copy of the host (Figure 18.1). Usually, the guest process
is in fact an operating system. A single physical machine can thus run multiple
operating systems concurrently, each in its own virtual machine.
Take a moment to note that with virtualization, the definition of “operat-
ing system” once again blurs. For example, consider VMM software such as
VMware ESX. This virtualization software is installed on the hardware, runs
when the hardware boots, and provides services to applications. The services
include traditional ones, such as scheduling and memory management, along
with new types, such as migration of applications between systems. Further-
more, the applications are, in fact, guest operating systems. Is the VMware ESX
VMM an operating system that, in turn, runs other operating systems? Certainly
it acts like an operating system. For clarity, however, we call the component that
provides virtual environments a VMM.
The implementation of VMMs varies greatly. Options include the following:
• Hardware-based solutions that provide support for virtual machine cre-
ation and management via firmware. These VMMs, which are commonly
found in mainframe and large to midsized servers, are generally known as
type 0 hypervisors. IBM LPARs and Oracle LDOMs are examples.
(a)
processes
hardware
kernel
(b)
programming
interface
processes
processes
processes
kernel
kernel
kernel
VM2
VM1
VM3
manager
hardware
virtual machine
Figure 18.1
System models. (a) Nonvirtual machine. (b) Virtual machine.


- Fundamental idea – abstract hardware of a single computer into several different execution environments
  - Similar to layered approach
  - But layer creates virtual system (virtual machine, or VM) on which operation systems or applications can run
- Several components
  - Host – underlying hardware system
  - Virtual machine manager (VMM) or hypervisor – creates and runs virtual machines by providing interface that is identical to the host
    - (Except in the case of paravirtualization)
  - Guest – process provided with virtual copy of the host
    - Usually an operating system
- Single physical machine can run multiple operating systems concurrently, each in its own virtual machine


**System Models**

- Non-virtual machine
- Virtual machine


> **[ASSET ch18_ill_001]** Figure from slide 5
> - type: illustration
> - kind: other
> - file: assets/ch18_slide05_img001.png
> - src: slides 5
> - shows: Illustration from slide 5
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Implementation of VMMs**

- Vary greatly, with options including:
  - Type 0 hypervisors - Hardware-based solutions that provide support for virtual machine creation and management via firmware
    - IBM LPARs and Oracle LDOMs are examples
  - Type 1 hypervisors - Operating-system-like software built to provide virtualization
    - Including VMware ESX, Joyent SmartOS, and Citrix XenServer
  - Type 1 hypervisors – Also includes general-purpose operating systems that provide standard functions as well as VMM functions
    - Including Microsoft Windows Server with HyperV and RedHat Linux with KVM
  - Type 2 hypervisors - Applications that run on standard operating systems but provide VMM features to guest operating systems
    - Including VMware Workstation and Fusion, Parallels Desktop, and Oracle VirtualBox


**Implementation of VMMs (Cont.)**

- Other variations include:
  - Paravirtualization - Technique in which the guest operating system is modified to work in cooperation with the VMM to optimize performance
  - Programming-environment virtualization - VMMs do not virtualize real hardware but instead create an optimized virtual system
    - Used by Oracle Java and Microsoft.Net
  - Emulators – Allow applications written for one hardware environment to run on a very different hardware environment, such as a different type of CPU


**Implementation of VMMs (Cont.)**

  - Application containment - Not virtualization at all but rather provides virtualization-like features by segregating applications from the operating system, making them more secure, manageable
    - Including Oracle Solaris Zones, BSD Jails, and IBM AIX WPARs
- Much variation due to breadth, depth and importance of virtualization in modern computing


## 18.2 History
> id: ch18-18-2 | src: book 18.2; slides 9-11 | kind: concept

INDIRECTION
“All problems in computer science can be solved by another level of indirec-
tion”—David Wheeler
“. . . except for the problem of too many layers of indirection.”—Kevlin
Henney
• Operating-system-like software built to provide virtualization, including
VMware ESX (mentioned above), Joyent SmartOS, and Citrix XenServer.
These VMMs are known as type 1 hypervisors.
• General-purpose operating systems that provide standard functions as
well as VMM functions, including Microsoft Windows Server with HyperV
and Red Hat Linux with the KVM feature. Because such systems have a
feature set similar to type 1 hypervisors, they are also known as type 1.
• Applications that run on standard operating systems but provide VMM
features to guest operating systems. These applications, which include
VMware Workstation and Fusion, Parallels Desktop, and Oracle Virtual-
Box, are type 2 hypervisors.
• Paravirtualization, a technique in which the guest operating system is
modified to work in cooperation with the VMM to optimize performance.
• Programming-environment virtualization, in which VMMs do not virtu-
alize real hardware but instead create an optimized virtual system. This
technique is used by Oracle Java and Microsoft.Net.
• Emulators that allow applications written for one hardware environment
to run on a very different hardware environment, such as a different type
of CPU.
• Application containment, which is not virtualization at all but rather
provides virtualization-like features by segregating applications from the
operating system. Oracle Solaris Zones, BSD Jails, and IBM AIX WPARs
“contain” applications, making them more secure and manageable.
The variety of virtualization techniques in use today is a testament to
the breadth, depth, and importance of virtualization in modern computing.
Virtualization is invaluable for data-center operations, efficient application
development, and software testing, among many other uses.


- First appeared in IBM mainframes in 1972
- Allowed multiple users to share a batch-oriented system
- Formal definition of virtualization helped move it beyond IBM
  - A VMM provides an environment for programs that is essentially identical to the original machine
  - Programs running within that environment show only minor performance decreases
  - The VMM is in complete control of system resources
- In late 1990s Intel CPUs fast enough for researchers to try virtualizing on general purpose PCs
  - Xen and VMware created technologies, still used today
  - Virtualization has expanded to many OSes, CPUs, VMMs


**Benefits and Features**

- Host system protected from VMs, VMs protected from each other
  - i.e., A virus less likely to spread
  - Sharing is provided though via shared file system volume, network communication
- Freeze, suspend, running VM
  - Then can move or copy somewhere else and resume
  - Snapshot of a given state, able to restore back to that state
    - Some VMMs allow multiple snapshots per VM
  - Clone by creating copy and running both original and copy
- Great for OS research, better system development efficiency
- Run multiple, different OSes on a single machine
  - Consolidation, app dev, …


**Benefits and Features (Cont.)**

- Templating – create an OS + application VM, provide it to customers, use it to create multiple instances of that combination
- Live migration – move a running VM from one host to another!
  - No interruption of user access
- All those features taken together -> cloud computing
  - Using APIs, programs tell cloud infrastructure (servers, networking, storage) to create new guests, VMs, virtual desktops


## 18.2 History
> id: ch18-18-2 | src: book 18.2 | kind: concept

Virtual machines first appeared commercially on IBM mainframes in 1972.
Virtualization was provided by the IBM VM operating system. This system has
evolved and is still available. In addition, many of its original concepts are
found in other systems, making it worth exploring.
Virtual Machines
IBM VM/370 divided a mainframe into multiple virtual machines, each
running its own operating system. A major difficulty with the VM approach
involved disk systems. Suppose that the physical machine had three disk
drives but wanted to support seven virtual machines. Clearly, it could not
allocate a disk drive to each virtual machine. The solution was to provide
virtual disks—termed minidisks in IBM’s VM operating system. The minidisks
were identical to the system’s hard disks in all respects except size. The system
implemented each minidisk by allocating as many tracks on the physical disks
as the minidisk needed.
Once the virtual machines were created, users could run any of the oper-
ating systems or software packages that were available on the underlying
machine. For the IBM VM system, a user normally ran CMS—a single-user
interactive operating system.
For many years after IBM introduced this technology, virtualization
remained in its domain. Most systems could not support virtualization.
However, a formal definition of virtualization helped to establish system
requirements and a target for functionality. The virtualization requirements
called for:
• Fidelity. A VMM provides an environment for programs that is essentially
identical to the original machine.
• Performance. Programs running within that environment show only
minor performance decreases.
• Safety. The VMM is in complete control of system resources.
These requirements still guide virtualization efforts today.
By the late 1990s, Intel 80x86 CPUs had become common, fast, and rich
in features. Accordingly, developers launched multiple efforts to implement
virtualization on that platform. Both Xen and VMware created technologies,
still used today, to allow guest operating systems to run on the 80x86. Since
that time, virtualization has expanded to include all common CPUs, many
commercial and open-source tools, and many operating systems. For exam-
ple, the open-source VirtualBox project (http://www.virtualbox.org) provides
a program that runs on Intel x86 and AMD 64 CPUs and on Windows, Linux,
macOS, and Solaris host operating systems. Possible guest operating systems
include many versions of Windows, Linux, Solaris, and BSD, including even
MS-DOS and IBM OS/2.


## 18.3 Beneﬁts and Features
> id: ch18-18-3 | src: book 18.3 | kind: concept

Several advantages make virtualization attractive. Most of them are fundamen-
tally related to the ability to share the same hardware yet run several different
execution environments (that is, different operating systems) concurrently.
One important advantage of virtualization is that the host system is pro-
tected from the virtual machines, just as the virtual machines are protected
from each other. A virus inside a guest operating system might damage that
operating system but is unlikely to affect the host or the other guests. Because


## 18.3 Benefit and Features
> id: ch18-18-3 | src: book 18.3 | kind: concept

each virtual machine is almost completely isolated from all other virtual
machines, there are almost no protection problems.
A potential disadvantage of isolation is that it can prevent sharing of
resources. Two approaches to providing sharing have been implemented. First,
it is possible to share a file-system volume and thus to share files. Second, it
is possible to define a network of virtual machines, each of which can send
information over the virtual communications network. The network is mod-
eled after physical communication networks but is implemented in software.
Of course, the VMM is free to allow any number of its guests to use physical
resources, such as a physical network connection (with sharing provided by the
VMM), in which case the allowed guests could communicate with each other
via the physical network.
One feature common to most virtualization implementations is the ability
to freeze, or suspend, a running virtual machine. Many operating systems
provide that basic feature for processes, but VMMs go one step further and
allow copies and snapshots to be made of the guest. The copy can be used
to create a new VM or to move a VM from one machine to another with its
current state intact. The guest can then resume where it was, as if on its original
machine, creating a clone. The snapshot records a point in time, and the guest
can be reset to that point if necessary (for example, if a change was made but
is no longer wanted). Often, VMMs allow many snapshots to be taken. For
example, snapshots might record a guest’s state every day for a month, making
restoration to any of those snapshot states possible. These abilities are used to
good advantage in virtual environments.
Avirtual machine system is a perfect vehicle for operating-system research
and development. Normally, changing an operating system is a difficult task.
Operating systems are large and complex programs, and a change in one
part may cause obscure bugs to appear in some other part. The power of
the operating system makes changing it particularly dangerous. Because the
operating system executes in kernel mode, a wrong change in a pointer could
cause an error that would destroy the entire file system. Thus, it is necessary
to test all changes to the operating system carefully.
Of course, the operating system runs on and controls the entire machine,
so the system must be stopped and taken out of use while changes are made
and tested. This period is commonly called system-development time. Since
it makes the system unavailable to users, system-development time on shared
systems is often scheduled late at night or on weekends, when system load is
low.
A virtual-machine system can eliminate much of this latter problem. Sys-
tem programmers are given their own virtual machine, and system develop-
ment is done on the virtual machine instead of on a physical machine. Normal
system operation is disrupted only when a completed and tested change is
ready to be put into production.
Another advantage of virtual machines for developers is that multiple
operating systems can run concurrently on the developer’s workstation. This
virtualized workstation allows for rapid porting and testing of programs in
varying environments. In addition, multiple versions of a program can run,
each in its own isolated operating system, within one system. Similarly, quality-
assurance engineers can test their applications in multiple environments with-
out buying, powering, and maintaining a computer for each environment.
Virtual Machines
A major advantage of virtual machines in production data-center use is
system consolidation, which involves taking two or more separate systems
and running them in virtual machines on one system. Such physical-to-virtual
conversions result in resource optimization, since many lightly used systems
can be combined to create one more heavily used system.
Consider, too, that management tools that are part of the VMM allow system
administrators to manage many more systems than they otherwise could.
A virtual environment might include 100 physical servers, each running 20
virtual servers. Without virtualization, 2,000 servers would require several
system administrators. With virtualization and its tools, the same work can be
managed by one or two administrators. One of the tools that make this possible
is templating, in which one standard virtual machine image, including an
installed and configured guest operating system and applications, is saved and
used as a source for multiple running VMs. Other features include managing
the patching of all guests, backing up and restoring the guests, and monitoring
their resource use.
Virtualization can improve not only resource utilization but also resource
management. Some VMMs include a live migration feature that moves a run-
ning guest from one physical server to another without interrupting its opera-
tion or active network connections. If a server is overloaded, live migration can
thus free resources on the source host while not disrupting the guest. Similarly,
when host hardware must be repaired or upgraded, guests can be migrated
to other servers, the evacuated host can be maintained, and then the guests
can be migrated back. This operation occurs without downtime and without
interruption to users.
Think about the possible effects of virtualization on how applications are
deployed. If a system can easily add, remove, and move a virtual machine,
then why install applications on that system directly? Instead, the application
could be preinstalled on a tuned and customized operating system in a vir-
tual machine. This method would offer several benefits for application devel-
opers. Application management would become easier, less tuning would be
required, and technical support of the application would be more straightfor-
ward. System administrators would find the environment easier to manage as
well. Installation would be simple, and redeploying the application to another
system would be much easier than the usual steps of uninstalling and rein-
stalling. For widespread adoption of this methodology to occur, though, the
format of virtual machines must be standardized so that any virtual machine
will run on any virtualization platform. The “Open Virtual Machine Format” is
an attempt to provide such standardization, and it could succeed in unifying
virtual machine formats.
Virtualization has laid the foundation for many other advances in com-
puter facility implementation, management, and monitoring. Cloud comput-
ing, for example, is made possible by virtualization in which resources such
as CPU, memory, and I/O are provided as services to customers using Internet
technologies. By using APIs, a program can tell a cloud computing facility to
create thousands of VMs, all running a specific guest operating system and
application, that others can access via the Internet. Many multiuser games,
photo-sharing sites, and other web services use this functionality.
In the area of desktop computing, virtualization is enabling desktop and
laptop computer users to connect remotely to virtual machines located in


## 18.4 Building Blocks
> id: ch18-18-4 | src: book 18.4; slides 12-44 | kind: concept

remote data centers and access their applications as if they were local. This
practice can increase security, because no data are stored on local disks at the
user’s site. The cost of the user’s computing resource may also decrease. The
user must have networking, CPU, and some memory, but all that these system
components need to do is display an image of the guest as its runs remotely (via
a protocol such as RDP). Thus, they need not be expensive, high-performance
components. Other uses of virtualization are sure to follow as it becomes more
prevalent and hardware support continues to improve.


- Generally difficult to provide an exact duplicate of underlying machine
  - Especially if only dual-mode operation available on CPU
  - But getting easier over time as CPU features and support for VMM improves
  - Most VMMs implement virtual CPU (VCPU) to represent state of CPU per guest as guest believes it to be
    - When guest context switched onto CPU by VMM, information from VCPU loaded and stored
  - Several techniques, as described in next slides


**Building Block – Trap and Emulate**

- Dual mode CPU means guest executes in user mode
  - Kernel runs in kernel mode
  - Not safe to let guest kernel run in kernel mode too
  - So VM needs two modes – virtual user mode and virtual kernel mode
    - Both of which run in real user mode
  - Actions in guest that usually cause switch to kernel mode must cause switch to virtual kernel mode


**Trap-and-Emulate (Cont.)**

- How does switch from virtual user mode to virtual kernel mode occur?
  - Attempting a privileged instruction in user mode causes an error -> trap
  - VMM gains control, analyzes error, executes operation as attempted by guest
  - Returns control to guest in user mode
  - Known as trap-and-emulate
  - Most virtualization products use this at least in part
- User mode code in guest runs at same speed as if not a guest
- But kernel mode privilege mode code runs slower due to trap-and-emulate
  - Especially a problem when multiple guests running, each needing trap-and-emulate
- CPUs adding hardware support, mode CPU modes to improve virtualization performance


**Trap-and-EmulateVirtualization Implementation**



> **[ASSET ch18_ill_002]** Figure from slide 15
> - type: illustration
> - kind: other
> - file: assets/ch18_slide15_img002.png
> - src: slides 15
> - shows: Illustration from slide 15
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Building Block – Binary Translation**

- Some CPUs don’t have clean separation between privileged and nonprivileged instructions
  - Earlier Intel x86 CPUs are among them
    - Earliest Intel CPU designed for a calculator
  - Backward compatibility means difficult to improve
  - Consider Intel x86 popf instruction
    - Loads CPU flags register from contents of the stack
    - If CPU in privileged mode -> all flags replaced
    - If CPU in user mode -> only some flags replaced
      - No trap is generated


**Binary Translation (Cont.)**

- Other similar problem instructions we will call special instructions
  - Caused trap-and-emulate method considered impossible until 1998
- Binary translation solves the problem
  - Basics are simple, but implementation very complex
  - If guest VCPU is in user mode, guest can run instructions natively
  - If guest VCPU in kernel mode (guest believes it is in kernel mode)
    - VMM examines every instruction guest is about to execute by reading a few instructions ahead of program counter
    - Non-special-instructions run natively
    - Special instructions translated into new set of instructions that perform equivalent task (for example changing the flags in the VCPU)


**Binary Translation (Cont.)**

- Implemented by translation of code within VMM
- Code reads native instructions dynamically from guest, on demand, generates native binary code that executes in place of original code
- Performance of this method would be poor without optimizations
  - Products like VMware use caching
    - Translate once, and when guest executes code containing special instruction cached translation used instead of translating again
    - Testing showed booting Windows XP as guest caused 950,000 translations, at 3 microseconds each, or 3 second (5 %) slowdown over native


**Binary TranslationVirtualization Implementation**



> **[ASSET ch18_ill_003]** Figure from slide 19
> - type: illustration
> - kind: other
> - file: assets/ch18_slide19_img003.png
> - src: slides 19
> - shows: Illustration from slide 19
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Nested Page Tables**

- Memory management another general challenge to VMM implementations
- How can VMM keep page-table state for both guests believing they control the page tables and VMM that does control the tables?
- Common method (for trap-and-emulate and binary translation) is nested page tables (NPTs)
  - Each guest maintains page tables to translate virtual to physical addresses
  - VMM maintains per guest NPTs to represent guest’s page-table state
    - Just as VCPU stores guest CPU state
  - When guest on CPU -> VMM makes that guest’s NPTs the active system page tables
  - Guest tries to change page table -> VMM makes equivalent change to NPTs and its own page tables
  - Can cause many more TLB misses -> much slower performance


**Building Blocks – Hardware Assistance**

- All virtualization needs some HW support
- More support -> more feature rich, stable, better performance of guests
- Intel added new VT-x instructions in 2005 and AMD the AMD-V instructions in 2006
  - CPUs with these instructions remove need for binary translation
  - Generally define more CPU modes – “guest” and “host”
  - VMM can enable host mode, define characteristics of each guest VM, switch to guest mode and guest(s) on CPU(s)
  - In guest mode, guest OS thinks it is running natively, sees devices (as defined by VMM for that guest)
    - Access to virtualized device, priv instructions cause trap to VMM
    - CPU maintains VCPU, context switches it as needed
- HW support for Nested Page Tables, DMA, interrupts as well over time


**Nested Page Tables**



> **[ASSET ch18_ill_004]** Figure from slide 22
> - type: illustration
> - kind: other
> - file: assets/ch18_slide22_img004.png
> - src: slides 22
> - shows: Illustration from slide 22
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Types of Virtual Machinesand Implementations**

- Many variations as well as HW details
  - Assume VMMs take advantage of HW features
    - HW features can simplify implementation, improve performance
- Whatever the type, a VM has a lifecycle
  - Created by VMM
  - Resources assigned to it (number of cores, amount of memory, networking details, storage details)
  - In type 0 hypervisor, resources usually dedicated
  - Other types dedicate or share resources, or a mix
  - When no longer needed, VM can be deleted, freeing resources
- Steps simpler, faster than with a physical machine install
  - Can lead to virtual machine sprawl with lots of VMs, history and state difficult to track


**Types of VMs – Type 0 Hypervisor**

- Old idea, under many names by HW manufacturers
  - “partitions”, “domains”
  - A HW feature implemented by firmware
  - OS need to nothing special, VMM is in firmware
  - Smaller feature set than other types
  - Each guest has dedicated HW
- I/O a challenge as difficult to have enough devices, controllers to dedicate to each guest
- Sometimes VMM implements a control partition running daemons that other guests communicate with for shared I/O
- Can provide virtualization-within-virtualization (guest itself can be a VMM with guests
  - Other types have difficulty doing this


**Type 0 Hypervisor**



> **[ASSET ch18_ill_005]** Figure from slide 25
> - type: illustration
> - kind: other
> - file: assets/ch18_slide25_img005.png
> - src: slides 25
> - shows: Illustration from slide 25
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Types of VMs – Type 1 Hypervisor**

- Commonly found in company datacenters
  - In a sense becoming “datacenter operating systems”
    - Datacenter managers control and manage OSes in new, sophisticated ways by controlling the Type 1 hypervisor
    - Consolidation of multiple OSes and apps onto less HW
    - Move guests between systems to balance performance
    - Snapshots and cloning


**Types of VMs – Type 1 Hypervisor (Cont.)**

- Special purpose operating systems that run natively on HW
  - Rather than providing system call interface, create run and manage guest OSes
  - Can run on Type 0 hypervisors but not on other Type 1s
  - Run in kernel mode
  - Guests generally don’t know they are running in a VM
  - Implement device drivers for host HW because no other component can
  - Also provide other traditional OS services like CPU and memory management


**Types of VMs – Type 1 Hypervisor (Cont.)**

- Another variation is a general purpose OS that also provides VMM functionality
  - RedHat Enterprise Linux with KVM, Windows with Hyper-V, Oracle Solaris
  - Perform normal duties as well as VMM duties
  - Typically less feature rich than dedicated Type 1 hypervisors
- In many ways, treat guests OSes as just another process
  - Albeit with special handling when guest tries to execute special instructions


**Types of VMs – Type 2 Hypervisor**

- Less interesting from an OS perspective
  - Very little OS involvement in virtualization
  - VMM is simply another process, run and managed by host
    - Even the host doesn’t know they are a VMM running guests
  - Tend to have poorer overall performance because can’t take advantage of some HW features
  - But also a benefit because require no changes to host OS
    - Student could have Type 2 hypervisor on native host, run multiple guests, all on standard host OS such as Windows, Linux, MacOS


**Types of VMs – Paravirtualization**

- Does not fit the definition of virtualization – VMM not presenting an exact duplication of underlying hardware
  - But still useful!
  - VMM provides services that guest must be modified to use
  - Leads to increased performance
  - Less needed as hardware support for VMs grows
- Xen, leader in paravirtualized space, adds several techniques
  - For example, clean and simple device abstractions
    - Efficient I/O
    - Good communication between guest and VMM about device I/O
    - Each device has circular buffer shared by guest and VMM via shared memory


**Xen I/O via Shared Circular Buffer**



> **[ASSET ch18_ill_006]** Figure from slide 31
> - type: illustration
> - kind: other
> - file: assets/ch18_slide31_img006.png
> - src: slides 31
> - shows: Illustration from slide 31
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Types of VMs – Paravirtualization (Cont.)**

- Xen, leader in paravirtualized space, adds several techniques (Cont.)
  - Memory management does not include nested page tables
    - Each guest has own read-only tables
    - Guest uses hypercall (call to hypervisor) when page-table changes needed
- Paravirtualization allowed virtualization of older x86 CPUs (and others) without binary translation
- Guest had to be modified to use run on paravirtualized VMM
- But on modern CPUs Xen no longer requires guest modification -> no longer paravirtualization


**Types of VMs –Programming Environment Virtualization**

- Also not-really-virtualization but using same techniques, providing similar features
- Programming language is designed to run within custom-built virtualized environment
  - For example Oracle Java has many features that depend on running in Java Virtual Machine (JVM)
- In this case virtualization is defined as providing APIs that define a set of features made available to a language and programs written in that language to provide an improved execution environment
- JVM compiled to run on many systems (including some smart phones even)
- Programs written in Java run in the JVM no matter the underlying system
- Similar to interpreted languages


**Types of VMs – Emulation**

- Another (older) way for running one operating system on a different operating system
  - Virtualization requires underlying CPU to be same as guest was compiled for
  - Emulation allows guest to run on different CPU
- Necessary to translate all guest instructions from guest CPU to native CPU
  - Emulation, not virtualization
- Useful when host system has one architecture, guest compiled for other architecture
  - Company replacing outdated servers with new servers containing different CPU architecture, but still want to run old applications
- Performance challenge – order of magnitude slower than native code
  - New machines faster than older machines so can reduce slowdown
- Very popular – especially in gaming where old consoles emulated on new


**Types of VMs –Application Containment**

- Some goals of virtualization are segregation of apps, performance and resource management, easy start, stop, move, and management of them
- Can do those things without full-fledged virtualization
  - If applications compiled for the host operating system, don’t need full virtualization to meet these goals
- Oracle containers / zones for example create virtual layer between OS and apps
  - Only one kernel running – host OS
  - OS and devices are virtualized, providing resources within zone with impression that they are only processes on system
  - Each zone has its own applications; networking stack, addresses, and ports; user accounts, etc
  - CPU and memory resources divided between zones
    - Zone can have its own scheduler to use those resources


**Solaris 10 with Two Zones**



> **[ASSET ch18_ill_007]** Figure from slide 36
> - type: illustration
> - kind: other
> - file: assets/ch18_slide36_img007.png
> - src: slides 36
> - shows: Illustration from slide 36
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Virtualization andOperating-System Components**

- Now look at operating system aspects of virtualization
  - CPU scheduling, memory management, I/O, storage, and unique VM migration feature
    - How do VMMs schedule CPU use when guests believe they have dedicated CPUs?
    - How can memory management work when many guests require large amounts of memory?


**OS Component – CPU Scheduling**

- Even single-CPU systems act like multiprocessor ones when virtualized
  - One or more virtual CPUs per guest
- Generally VMM has one or more physical CPUs and number of threads to run on them
  - Guests configured with certain number of VCPUs
    - Can be adjusted throughout life of VM
  - When enough CPUs for all guests -> VMM can allocate dedicated CPUs, each guest much like native operating system managing its CPUs
  - Usually not enough CPUs -> CPU overcommitment
    - VMM can use standard scheduling algorithms to put threads on CPUs
    - Some add fairness aspect


**OS Component – CPU Scheduling (Cont.)**

- Cycle stealing by VMM and oversubscription of CPUs means guests don’t get CPU cycles they expect
  - Consider timesharing scheduler in a guest trying to schedule 100ms time slices -> each may take 100ms, 1 second, or longer
    - Poor response times for users of guest
    - Time-of-day clocks incorrect
  - Some VMMs provide application to run in each guest to fix time-of-day and provide other integration features


**OS Component – Memory Management**

- Also suffers from oversubscription -> requires extra management efficiency from VMM
- For example, VMware ESX guests have a configured amount of physical memory, then ESX uses 3 methods of memory management
  - Double-paging, in which the guest page table indicates a page is in a physical frame but the VMM moves some of those pages to backing store
  - Install a pseudo-device driver in each guest (it looks like a device driver to the guest kernel but really just adds kernel-mode code to the guest)
    - Balloon memory manager communicates with VMM and is told to allocate or de-allocate memory to decrease or increase physical memory use of guest, causing guest OS to free or have more memory available
  - De-duplication by VMM determining if same page loaded more than once, memory mapping the same page into multiple guests


**OS Component – I/O**

- Easier for VMMs to integrate with guests because I/O has lots of variation
  - Already somewhat segregated / flexible via device drivers
  - VMM can provide new devices and device drivers
- But overall I/O is complicated for VMMs
  - Many short paths for I/O in standard OSes for improved performance
  - Less hypervisor needs to do for I/O for guests, the better
  - Possibilities include direct device access, DMA pass-through, direct interrupt delivery
    - Again, HW support needed for these
- Networking also complex as VMM and guests all need network access
  - VMM can bridge guest to network (allowing direct access)
  - And / or provide network address translation (NAT)
    - NAT address local to machine on which guest is running, VMM provides address translation to guest to hide its address


**OS Component – Storage Management**

- Both boot disk and general data access need  be provided by VMM
- Need to support potentially dozens of guests per VMM (so standard disk partitioning not sufficient)
- Type 1 – storage guest root disks and config information within file system provided by VMM as a disk image
- Type 2 – store as files in file system provided by host OS
- Duplicate file -> create new guest
- Move file to another system -> move guest
- Physical-to-virtual (P-to-V) convert native disk blocks into VMM format
- Virtual-to-physical (V-to-P) convert from virtual format to native or disk format
- VMM also needs to provide access to network attached storage (just networking) and other disk images, disk partitions, disks, etc.


**OS Component – Live Migration**

- Taking advantage of VMM features leads to new functionality not found on general operating systems such as live migration
- Running guest can be moved between systems, without interrupting user access to the guest or its apps
- Very useful for resource management, maintenance downtime windows, etc.
  - The source VMM establishes a connection with the target VMM
  - The target creates a new guest by creating a new VCPU, etc.
  - The source sends all read-only guest memory pages to the target
  - The source sends all read-write pages to the target, marking them as clean
  - The source repeats step 4, as during that step some pages were probably modified by the guest and are now dirty
  - When cycle of steps 4 and 5 becomes very short, source VMM freezes guest, sends VCPU’s final state, sends other state details, sends final dirty pages, and tells target to start running the guest
    - Once target acknowledges that guest running, source terminates guest


**Live Migration of Guest Between Servers**



> **[ASSET ch18_ill_008]** Figure from slide 44
> - type: illustration
> - kind: other
> - file: assets/ch18_slide44_img008.png
> - src: slides 44
> - shows: Illustration from slide 44
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 18.4 Building Blocks
> id: ch18-18-4 | src: book 18.4 | kind: concept

Although the virtual machine concept is useful, it is difficult to implement.
Much work is required to provide an exact duplicate of the underlying
machine. This is especially a challenge on dual-mode systems, where the
underlying machine has only user mode and kernel mode. In this section, we
examine the building blocks that are needed for efficient virtualization. Note
that these building blocks are not required by type 0 hypervisors, as discussed
in Section 18.5.2.
The ability to virtualize depends on the features provided by the CPU. If
the features are sufficient, then it is possible to write a VMM that provides
a guest environment. Otherwise, virtualization is impossible. VMMs use sev-
eral techniques to implement virtualization, including trap-and-emulate and
binary translation. We discuss each of these techniques in this section, along
with the hardware support needed to support virtualization.
As you read the section, keep in mind that an important concept found
in most virtualization options is the implementation of a virtual CPU (VCPU).
The VCPU does not execute code. Rather, it represents the state of the CPU as
the guest machine believes it to be. For each guest, the VMM maintains a VCPU
representing that guest’s current CPU state. When the guest is context-switched
onto a CPU by the VMM, information from the VCPU is used to load the right
context, much as a general-purpose operating system would use the PCB.
Trap-and-Emulate
On a typical dual-mode system, the virtual machine guest can execute only in
user mode (unless extra hardware support is provided). The kernel, of course,
runs in kernel mode, and it is not safe to allow user-level code to run in
kernel mode. Just as the physical machine has two modes, so must the virtual
machine. Consequently, we must have a virtual user mode and a virtual kernel
mode, both of which run in physical user mode. Those actions that cause a
transfer from user mode to kernel mode on a real machine (such as a system
call, an interrupt, or an attempt to execute a privileged instruction) must also
cause a transfer from virtual user mode to virtual kernel mode in the virtual
machine.
How can such a transfer be accomplished? The procedure is as follows:
When the kernel in the guest attempts to execute a privileged instruction,
that is an error (because the system is in user mode) and causes a trap to the
VMM in the real machine. The VMM gains control and executes (or “emulates”)
the action that was attempted by the guest kernel on the part of the guest. It
Virtual Machines
privileged instruction
operating
system
VCPU
VMM
VMM
guest
kernel mode
user mode
emulate action
return
trap
update
user processes
Figure 18.2
Trap-and-emulate virtualization implementation.
then returns control to the virtual machine. This is called the trap-and-emulate
method and is shown in Figure 18.2.
With privileged instructions, time becomes an issue. All nonprivileged
instructions run natively on the hardware, providing the same performance
for guests as native applications. Privileged instructions create extra overhead,
however, causing the guest to run more slowly than it would natively. In
addition, the CPU is being multiprogrammed among many virtual machines,
which can further slow down the virtual machines in unpredictable ways.
This problem has been approached in various ways. IBM VM, for exam-
ple, allows normal instructions for the virtual machines to execute directly
on the hardware. Only the privileged instructions (needed mainly for I/O)
must be emulated and hence execute more slowly. In general, with the evolu-
tion of hardware, the performance of trap-and-emulate functionality has been
improved, and cases in which it is needed have been reduced. For example,
many CPUs now have extra modes added to their standard dual-mode opera-
tion. The VCPU need not keep track of what mode the guest operating system is
in, because the physical CPU performs that function. In fact, some CPUs provide
guest CPU state management in hardware, so the VMM need not supply that
functionality, removing the extra overhead.
Binary Translation
Some CPUs do not have a clean separation of privileged and nonprivileged
instructions. Unfortunately for virtualization implementers, the Intel x86 CPU
line is one of them. No thought was given to running virtualization on the
x86 when it was designed. (In fact, the first CPU in the family—the Intel
4004, released in 1971—was designed to be the core of a calculator.) The chip
has maintained backward compatibility throughout its lifetime, preventing
changes that would have made virtualization easier through many genera-
tions.


## 18.4 Building Blocks
> id: ch18-18-4 | src: book 18.4 | kind: concept

Let’s consider an example of the problem. The command popf loads the
flag register from the contents of the stack. If the CPU is in privileged mode, all
of the flags are replaced from the stack. If the CPU is in user mode, then only
some flags are replaced, and others are ignored. Because no trap is generated
if popf is executed in user mode, the trap-and-emulate procedure is rendered
useless. Other x86 instructions cause similar problems. For the purposes of this
discussion, we will call this set of instructions special instructions. As recently
as 1998, using the trap-and-emulate method to implement virtualization on the
x86 was considered impossible because of these special instructions.
This previously insurmountable problem was solved with the implemen-
tation of the binary translation technique. Binary translation is fairly simple in
concept but complex in implementation. The basic steps are as follows:
1. If the guest VCPU is in user mode, the guest can run its instructions
natively on a physical CPU.
2. If the guest VCPU is in kernel mode, then the guest believes that it is run-
ning in kernel mode. The VMM examines every instruction the guest exe-
cutes in virtual kernel mode by reading the next few instructions that the
guest is going to execute, based on the guest’s program counter. Instruc-
tions other than special instructions are run natively. Special instructions
are translated into a new set of instructions that perform the equivalent
task—for example, changing the flags in the VCPU.
Binary translation is shown in Figure 18.3. It is implemented by translation
code within the VMM. The code reads native binary instructions dynamically
from the guest, on demand, and generates native binary code that executes in
place of the original code.
user processes
special instruction
(VMM reads instructions)
operating
system
VCPU
VMM
VMM
guest
kernel mode
user mode
translate
execute translation
return
update
Figure 18.3
Binary translation virtualization implementation.
Virtual Machines
The basic method of binary translation just described would execute
correctly but perform poorly. Fortunately, the vast majority of instructions
would execute natively. But how could performance be improved for the other
instructions? We can turn to a specific implementation of binary translation,
the VMware method, to see one way of improving performance. Here, caching
provides the solution. The replacement code for each instruction that needs
to be translated is cached. All later executions of that instruction run from the
translation cache and need not be translated again. If the cache is large enough,
this method can greatly improve performance.
Let’s consider another issue in virtualization: memory management,
specifically the page tables. How can the VMM keep page-table state both for
guests that believe they are managing the page tables and for the VMM itself?
A common method, used with both trap-and-emulate and binary translation,
is to use nested page tables (NPTs). Each guest operating system maintains
one or more page tables to translate from virtual to physical memory. The
VMM maintains NPTs to represent the guest’s page-table state, just as it creates
a VCPU to represent the guest’s CPU state. The VMM knows when the guest
tries to change its page table, and it makes the equivalent change in the NPT.
When the guest is on the CPU, the VMM puts the pointer to the appropriate
NPT into the appropriate CPU register to make that table the active page table.
If the guest needs to modify the page table (for example, fulfilling a page
fault), then that operation must be intercepted by the VMM and appropriate
changes made to the nested and system page tables. Unfortunately, the use of
NPTs can cause TLB misses to increase, and many other complexities need to
be addressed to achieve reasonable performance.
Although it might seem that the binary translation method creates large
amounts of overhead, it performed well enough to launch a new industry
aimed at virtualizing Intel x86-based systems. VMware tested the performance
impact of binary translation by booting one such system, Windows XP, and
immediately shutting it down while monitoring the elapsed time and the
number of translations produced by the binary translation method. The result
was 950,000 translations, taking 3 microseconds each, for a total increase of
3 seconds (about 5 percent) over native execution of Windows XP. To achieve
that result, developers used many performance improvements that we do not
discuss here. For more information, consult the bibliographical notes at the end
of this chapter.
Hardware Assistance
Without some level of hardware support, virtualization would be impossible.
The more hardware support available within a system, the more feature-rich
and stable the virtual machines can be and the better they can perform. In the
Intel x86 CPU family, Intel added new virtualization support (the VT-x instruc-
tions) in successive generations beginning in 2005. Now, binary translation is
no longer needed.
In fact, all major general-purpose CPUs now provide extended hardware
support for virtualization. For example, AMD virtualization technology (AMD-
V) has appeared in several AMD processors starting in 2006. It defines two new
modes of operation—host and guest—thus moving from a dual-mode to a


## 18.4 Building Blocks
> id: ch18-18-4 | src: book 18.4 | kind: concept

multimode processor. The VMM can enable host mode, define the characteris-
tics of each guest virtual machine, and then switch the system to guest mode,
passing control of the system to a guest operating system that is running in
the virtual machine. In guest mode, the virtualized operating system thinks it
is running on native hardware and sees whatever devices are included in the
host’s definition of the guest. If the guest tries to access a virtualized resource,
then control is passed to the VMM to manage that interaction. The functionality
in Intel VT-x is similar, providing root and nonroot modes, equivalent to host
and guest modes. Both provide guest VCPU state data structures to load and
save guest CPU state automatically during guest context switches. In addition,
virtual machine control structures (VMCSs) are provided to manage guest
and host state, as well as various guest execution controls, exit controls, and
information about why guests exit back to the host. In the latter case, for exam-
ple, a nested page-table violation caused by an attempt to access unavailable
memory can result in the guest’s exit.
AMD and Intel have also addressed memory management in the virtual
environment. With AMD’s RVI and Intel’s EPT memory-management enhance-
ments, VMMs no longer need to implement software NPTs. In essence, these
CPUs implement nested page tables in hardware to allow the VMM to fully
control paging while the CPUs accelerate the translation from virtual to phys-
ical addresses. The NPTs add a new layer, one representing the guest’s view
of logical-to-physical address translation. The CPU page-table walking func-
tion (traversing the data structure to find the desired data) includes this new
layer as necessary, walking through the guest table to the VMM table to find the
physical address desired. A TLB miss results in a performance penalty, because
more tables (the guest and host page tables) must be traversed to complete
the lookup. Figure 18.4 shows the extra translation work performed by the
hardware to translate from a guest virtual address to a final physical address.
I/O is another area improved by hardware assistance. Consider that the
standard direct-memory-access (DMA) controller accepts a target memory
address and a source I/O device and transfers data between the two without
operating-system action. Without hardware assistance, a guest might try to
set up a DMA transfer that affects the memory of the VMM or other guests. In
CPUs that provide hardware-assisted DMA (such as Intel CPUs with VT-d), even
DMA has a level of indirection. First, the VMM sets up protection domains to
tell the CPU which physical memory belongs to each guest. Next, it assigns the
I/O devices to the protection domains, allowing them direct access to those
memory regions and only those regions. The hardware then transforms the
address in a DMA request issued by an I/O device to the host physical memory
address associated with the I/O. In this manner, DMA transfers are passed
through between a guest and a device without VMM interference.
Similarly, interrupts must be delivered to the appropriate guest and must
not be visible to other guests. By providing an interrupt remapping feature,
CPUs with virtualization hardware assistance automatically deliver an inter-
rupt destined for a guest to a core that is currently running a thread of that
guest. That way, the guest receives interrupts without any need for the VMM
to intercede in their delivery. Without interrupt remapping, malicious guests
could generate interrupts that could be used to gain control of the host system.
(See the bibliographical notes at the end of this chapter for more details.)
Virtual Machines
VMM nested page table data structure
PML4E
PDPTE
PDE
PTE
phy addr
host physical address
offset
table
directory
directory ptr
PML4
guest virtual address
kernel paging data
structures
guest physical address
guest
Figure 18.4
Nested page tables.
ARM architectures, specifically ARM v8 (64-bit) take a slightly different
approach to hardware support of virtualization. They provide an entire excep-
tion level—EL2—which is even more privileged than that of the kernel (EL1).
This allows the running of a secluded hypervisor, with its own MMU access
and interrupt trapping. To allow for paravirtualization, a special instruction
(HVC) is added. It allows the hypervisor to be called from guest kernels. This
instruction can only be called from within kernel mode (EL1).
An interesting side effect of hardware-assisted virtualization is that it
allows for the creation of thin hypervisors. A good example is macOS’s hyper-
visor framework (“HyperVisor.framework”), which is an operating-system-
supplied library that allows the creation of virtual machines in a few lines of


## 18.5 Types of VMs and Their Implementations
> id: ch18-18-5 | src: book 18.5 | kind: concept

code. The actual work is done via system calls, which have the kernel call the
privileged virtualization CPU instructions on behalf of the hypervisor process,
allowing management of virtual machines without the hypervisor needing to
load a kernel module of its own to execute those calls.


## 18.5 Types of VMs and Their Implementations
> id: ch18-18-5 | src: book 18.5 | kind: concept

We’ve now looked at some of the techniques used to implement virtualization.
Next, we consider the major types of virtual machines, their implementation,
their functionality, and how they use the building blocks just described to
create a virtual environment. Of course, the hardware on which the virtual
machines are running can cause great variation in implementation methods.
Here, we discuss the implementations in general, with the understanding that
VMMs take advantage of hardware assistance where it is available.
The Virtual Machine Life Cycle
Let’s begin with the virtual machine life cycle. Whatever the hypervisor type,
at the time a virtual machine is created, its creator gives the VMM certain
parameters. These parameters usually include the number of CPUs, amount
of memory, networking details, and storage details that the VMM will take into
account when creating the guest. For example, a user might want to create a
new guest with two virtual CPUs, 4 GB of memory, 10 GB of disk space, one
network interface that gets its IP address via DHCP, and access to the DVD drive.
The VMM then creates the virtual machine with those parameters. In the
case of a type 0 hypervisor, the resources are usually dedicated. In this situa-
tion, if there are not two virtual CPUs available and unallocated, the creation
request in our example will fail. For other hypervisor types, the resources are
dedicated or virtualized, depending on the type. Certainly, an IP address can-
not be shared, but the virtual CPUs are usually multiplexed on the physical
CPUs as discussed in Section 18.6.1. Similarly, memory management usually
involves allocating more memory to guests than actually exists in physical
memory. This is more complicated and is described in Section 18.6.2.
Finally, when the virtual machine is no longer needed, it can be deleted.
When this happens, the VMM first frees up any used disk space and then
removes the configuration associated with the virtual machine, essentially
forgetting the virtual machine.
These steps are quite simple compared with building, configuring, run-
ning, and removing physical machines. Creating a virtual machine from an
existing one can be as easy as clicking the “clone” button and providing a new
name and IP address. This ease of creation can lead to virtual machine sprawl,
which occurs when there are so many virtual machines on a system that their
use, history, and state become confusing and difficult to track.
Type 0 Hypervisor
Type 0 hypervisors have existed for many years under many names, including
“partitions” and “domains.” They are a hardware feature, and that brings its
own positives and negatives. Operating systems need do nothing special to
take advantage of their features. The VMM itself is encoded in the firmware and
Virtual Machines
guest 1
guest 2
CPUs
memory
CPUs
memory
hypervisor (in firmware)
I/O
CPUs
memory
CPUs
memory
guest 3
guest 4
guest
guest
guest
guest
guest
Figure 18.5
Type 0 hypervisor.
loaded at boot time. In turn, it loads the guest images to run in each partition.
The feature set of a type 0 hypervisor tends to be smaller than those of the other
types because it is implemented in hardware. For example, a system might be
split into four virtual systems, each with dedicated CPUs, memory, and I/O
devices. Each guest believes that it has dedicated hardware because it does,
simplifying many implementation details.
I/O presents some difficulty, because it is not easy to dedicate I/O devices
to guests if there are not enough. What if a system has two Ethernet ports and
more than two guests, for example? Either all guests must get their own I/O
devices, or the system must provided I/O device sharing. In these cases, the
hypervisor manages shared access or grants all devices to a control partition.
In the control partition, a guest operating system provides services (such as net-
working) via daemons to other guests, and the hypervisor routes I/O requests
appropriately. Some type 0 hypervisors are even more sophisticated and can
move physical CPUs and memory between running guests. In these cases, the
guests are paravirtualized, aware of the virtualization and assisting in its exe-
cution. For example, a guest must watch for signals from the hardware or VMM
that a hardware change has occurred, probe its hardware devices to detect the
change, and add or subtract CPUs or memory from its available resources.
Because type 0 virtualization is very close to raw hardware execution, it
should be considered separately from the other methods discussed here. Atype
0 hypervisor can run multiple guest operating systems (one in each hardware
partition). All of those guests, because they are running on raw hardware, can
in turn be VMMs. Essentially, each guest operating system in a type 0 hypervisor
is a native operating system with a subset of hardware made available to it.
Because of that, each can have its own guest operating systems (Figure 18.5).
Other types of hypervisors usually cannot provide this virtualization-within-
virtualization functionality.
Type 1 Hypervisor
Type 1 hypervisors are commonly found in company data centers and are, in a
sense, becoming “the data-center operating system.” They are special-purpose
operating systems that run natively on the hardware, but rather than providing


## 18.5 Types of VMs and Their Implementations
> id: ch18-18-5 | src: book 18.5 | kind: concept

system calls and other interfaces for running programs, they create, run, and
manage guest operating systems. In addition to running on standard hard-
ware, they can run on type 0 hypervisors, but not on other type 1 hypervisors.
Whatever the platform, guests generally do not know they are running on
anything but the native hardware.
Type 1 hypervisors run in kernel mode, taking advantage of hardware pro-
tection. Where the host CPU allows, they use multiple modes to give guest oper-
ating systems their own control and improved performance. They implement
device drivers for the hardware they run on, since no other component could
do so. Because they are operating systems, they must also provide CPU schedul-
ing, memory management, I/O management, protection, and even security.
Frequently, they provide APIs, but those APIs support applications in guests or
external applications that supply features like backups, monitoring, and secu-
rity. Many type 1 hypervisors are closed-source commercial offerings, such as
VMware ESX, while some are open source or hybrids of open and closed source,
such as Citrix XenServer and its open Xen counterpart.
By using type 1 hypervisors, data-center managers can control and man-
age the operating systems and applications in new and sophisticated ways.
An important benefit is the ability to consolidate more operating systems and
applications onto fewer systems. For example, rather than having ten systems
running at 10 percent utilization each, a data center might have one server man-
age the entire load. If utilization increases, guests and their applications can be
moved to less-loaded systems live, without interruption of service. Using snap-
shots and cloning, the system can save the states of guests and duplicate those
states—a much easier task than restoring from backups or installing manually
or via scripts and tools. The price of this increased manageability is the cost
of the VMM (if it is a commercial product), the need to learn new management
tools and methods, and the increased complexity.
Another type of type 1 hypervisor includes various general-purpose oper-
ating systems with VMM functionality. Here, an operating system such as Red-
Hat Enterprise Linux, Windows, or Oracle Solaris performs its normal duties
as well as providing a VMM allowing other operating systems to run as guests.
Because of their extra duties, these hypervisors typically provide fewer virtual-
ization features than other type 1 hypervisors. In many ways, they treat a guest
operating system as just another process, but they provide special handling
when the guest tries to execute special instructions.
Type 2 Hypervisor
Type 2 hypervisors are less interesting to us as operating-system explorers,
because there is very little operating-system involvement in these application-
level virtual machine managers. This type of VMM is simply another process
run and managed by the host, and even the host does not know that virtual-
ization is happening within the VMM.
Type 2 hypervisors have limits not associated with some of the other types.
For example, a user needs administrative privileges to access many of the
hardware assistance features of modern CPUs. If the VMM is being run by a
standard user without additional privileges, the VMM cannot take advantage
of these features. Due to this limitation, as well as the extra overhead of running
Virtual Machines
request producer
shared pointer
updated by guest OS
request consumer
private pointer
in Xen
response producer
shared pointer
updated by
Xen
response consumer
private pointer
in guest OS
request queue - descriptors queued by the VM but not yet accepted by Xen
outstanding descriptors - descriptor slots awaiting a response from Xen
response queue - descriptors returned by Xen in response to serviced requests
unused descriptors
Figure 18.6
Xen I/O via shared circular buffer.1
a general-purpose operating system as well as guest operating systems, type 2
hypervisors tend to have poorer overall performance than type 0 or type 1.
As is often the case, the limitations of type 2 hypervisors also provide
some benefits. They run on a variety of general-purpose operating systems,
and running them requires no changes to the host operating system. A student
can use a type 2 hypervisor, for example, to test a non-native operating system
without replacing the native operating system. In fact, on an Apple laptop,
a student could have versions of Windows, Linux, Unix, and less common
operating systems all available for learning and experimentation.
Paravirtualization
As we’ve seen, paravirtualization works differently than the other types of
virtualization. Rather than try to trick a guest operating system into believing
it has a system to itself, paravirtualization presents the guest with a system
that is similar but not identical to the guest’s preferred system. The guest must
be modified to run on the paravirtualized virtual hardware. The gain for this
extra work is more efficient use of resources and a smaller virtualization layer.
The Xen VMM became the leader in paravirtulization by implementing
several techniques to optimize the performance of guests as well as of the host
system. For example, as mentioned earlier, some VMMs present virtual devices
to guests that appear to be real devices. Instead of taking that approach, the Xen
VMM presented clean and simple device abstractions that allow efficient I/O as
well as good I/O-related communication between the guest and the VMM. For
1Barham, Paul. “Xen and the Art of Virtualization”. SOSP ’03 Proceedings of the Nineteenth ACM
Symposium on Operating Systems Principles, p 164-177. c⃝2003 Association for Computing Machinery,
Inc


## 18.5 Types of VMs and Their Implementations
> id: ch18-18-5 | src: book 18.5 | kind: concept

each device used by each guest, there was a circular buffer shared by the guest
and the VMM via shared memory. Read and write data are placed in this buffer,
as shown in Figure 18.6.
For memory management, Xen did not implement nested page tables.
Rather, each guest had its own set of page tables, set to read-only. Xen required
the guest to use a specific mechanism, a hypercall from the guest to the hyper-
visor VMM, when a page-table change was needed. This meant that the guest
operating system’s kernel code must have been changed from the default code
to these Xen-specific methods. To optimize performance, Xen allowed the guest
to queue up multiple page-table changes asynchronously via hypercalls and
then checked to ensure that the changes were complete before continuing
operation.
Xen allowed virtualization of x86 CPUs without the use of binary trans-
lation, instead requiring modifications in the guest operating systems like the
one described above. Over time, Xen has taken advantage of hardware features
supporting virtualization. As a result, it no longer requires modified guests and
essentially does not need the paravirtualization method. Paravirtualization is
still used in other solutions, however, such as type 0 hypervisors.
Programming-Environment Virtualization
Another kind of virtualization, based on a different execution model, is the
virtualization of programming environments. Here, a programming language
is designed to run within a custom-built virtualized environment. For exam-
ple, Oracle’s Java has many features that depend on its running in the Java
virtual machine (JVM), including specific methods for security and memory
management.
If we define virtualization as including only duplication of hardware, this is
not really virtualization at all. But we need not limit ourselves to that definition.
Instead, we can define a virtual environment, based on APIs, that provides a set
of features we want to have available for a particular language and programs
written in that language. Java programs run within the JVM environment, and
the JVM is compiled to be a native program on systems on which it runs. This
arrangement means that Java programs are written once and then can run on
any system (including all of the major operating systems) on which a JVM is
available. The same can be said of interpreted languages, which run inside
programs that read each instruction and interpret it into native operations.
Emulation
Virtualization is probably the most common method for running applications
designed for one operating system on a different operating system, but on the
same CPU. This method works relatively efficiently because the applications
were compiled for the instruction set that the target system uses.
But what if an application or operating system needs to run on a different
CPU? Here, it is necessary to translate all of the source CPU’s instructions so
that they are turned into the equivalent instructions of the target CPU. Such an
environment is no longer virtualized but rather is fully emulated.
Emulation is useful when the host system has one system architecture
and the guest system was compiled for a different architecture. For example,
Virtual Machines
suppose a company has replaced its outdated computer system with a new
system but would like to continue to run certain important programs that were
compiled for the old system. The programs could be run in an emulator that
translates each of the outdated system’s instructions into the native instruction
set of the new system. Emulation can increase the life of programs and allow
us to explore old architectures without having an actual old machine.
As may be expected, the major challenge of emulation is performance.
Instruction-set emulation may run an order of magnitude slower than native
instructions, because it may take ten instructions on the new system to read,
parse, and simulate an instruction from the old system. Thus, unless the new
machine is ten times faster than the old, the program running on the new
machine will run more slowly than it did on its native hardware. Another
challenge for emulator writers is that it is difficult to create a correct emulator
because, in essence, this task involves writing an entire CPU in software.
In spite of these challenges, emulation is very popular, particularly in
gaming circles. Many popular video games were written for platforms that are
no longer in production. Users who want to run those games frequently can
find an emulator of such a platform and then run the game unmodified within
the emulator. Modern systems are so much faster than old game consoles that
even the Apple iPhone has game emulators and games available to run within
them.
Application Containment
The goal of virtualization in some instances is to provide a method to segregate
applications, manage their performance and resource use, and create an easy
way to start, stop, move, and manage them. In such cases, perhaps full-fledged
virtualization is not needed. If the applications are all compiled for the same
operating system, then we do not need complete virtualization to provide these
features. We can instead use application containment.
Consider one example of application containment. Starting with version
10, Oracle Solaris has included containers, or zones, that create a virtual layer
between the operating system and the applications. In this system, only one
kernel is installed, and the hardware is not virtualized. Rather, the operating
system and its devices are virtualized, providing processes within a zone with
the impression that they are the only processes on the system. One or more
containers can be created, and each can have its own applications, network
stacks, network address and ports, user accounts, and so on. CPU and memory
resources can be divided among the zones and the system-wide processes.
Each zone, in fact, can run its own scheduler to optimize the performance of
its applications on the allotted resources. Figure 18.7 shows a Solaris 10 system
with two containers and the standard “global” user space.
Containers are much lighter weight than other virtualization methods.
That is, they use fewer system resources and are faster to instantiate and
destroy, more similar to processes than virtual machines. For this reason, they
are becoming more commonly used, especially in cloud computing. FreeBSD
was perhaps the first operating system to include a container-like feature
(called “jails”), and AIX has a similar feature. Linux added the LXC container
feature in 2014. It is now included in the common Linux distributions via


## 18.6 Virtualization and Operating-System Components
> id: ch18-18-6 | src: book 18.6 | kind: concept

virtual platform
device management
zone 1
global zone
Solaris kernel
network addresses
zone 2
zone management
user programs
system programs
CPU resources
memory resources
user programs
system programs
network addresses
device access
CPU resources
memory resources
user programs
system programs
network addresses
device access
CPU resources
memory resources
device
device
…
Figure 18.7
Solaris 10 with two zones.
a flag in the clone() system call. (The source code for LXCis available at
https://linuxcontainers.org/lxc/downloads.)
Containers are also easy to automate and manage, leading to orchestration
tools like docker and Kubernetes. Orchestration tools are means of automat-
ing and coordinating systems and services. Their aim is to make it simple to
run entire suites of distributed applications, just as operating systems make
it simple to run a single program. These tools offer rapid deployment of
full applications, consisting of many processes within containers, and also
offer monitoring and other administration features. For more on docker, see
https://www.docker.com/what-docker. Information about Kubernetes can be
found at https://kubernetes.io/docs/concepts/overview/what-is-kubernetes.


## 18.6 Virtualization and Operating-System Components
> id: ch18-18-6 | src: book 18.6 | kind: concept

Thus far, we have explored the building blocks of virtualization and the var-
ious types of virtualization. In this section, we take a deeper dive into the
operating-system aspects of virtualization, including how the VMM provides
core operating-system functions like scheduling, I/O, and memory manage-
ment. Here, we answer questions such as these: How do VMMs schedule CPU
use when guest operating systems believe they have dedicated CPUs? How
can memory management work when many guests require large amounts of
memory?
Virtual Machines
CPU Scheduling
A system with virtualization, even a single-CPU system, frequently acts like
a multiprocessor system. The virtualization software presents one or more
virtual CPUs to each of the virtual machines running on the system and then
schedules the use of the physical CPUs among the virtual machines.
The significant variations among virtualization technologies make it diffi-
cult to summarize the effect of virtualization on scheduling. First, let’s consider
the general case of VMM scheduling. The VMM has a number of physical CPUs
available and a number of threads to run on those CPUs. The threads can be
VMM threads or guest threads. Guests are configured with a certain number of
virtual CPUs at creation time, and that number can be adjusted throughout the
life of the VM. When there are enough CPUs to allocate the requested number to
each guest, the VMM can treat the CPUs as dedicated and schedule only a given
guest’s threads on that guest’s CPUs. In this situation, the guests act much like
native operating systems running on native CPUs.
Of course, in other situations, there may not be enough CPUs to go around.
The VMM itself needs some CPU cycles for guest management and I/O man-
agement and can steal cycles from the guests by scheduling its threads across
all of the system CPUs, but the impact of this action is relatively minor. More
difficult is the case of overcommitment, in which the guests are configured for
more CPUs than exist in the system. Here, a VMM can use standard scheduling
algorithms to make progress on each thread but can also add a fairness aspect to
those algorithms. For example, if there are six hardware CPUs and twelve guest-
allocated CPUs, the VMM can allocate CPU resources proportionally, giving each
guest half of the CPU resources it believes it has. The VMM can still present all
twelve virtual CPUs to the guests, but in mapping them onto physical CPUs, the
VMM can use its scheduler to distribute them appropriately.
Even given a scheduler that provides fairness, any guest operating-system
scheduling algorithm that assumes a certain amount of progress in a given
amount of time will most likely be negatively affected by virtualization. Con-
sider a time-sharing operating system that tries to allot 100 milliseconds to each
time slice to give users a reasonable response time. Within a virtual machine,
this operating system receives only what CPU resources the virtualization sys-
tem gives it. A 100-millisecond time slice may take much more than 100 mil-
liseconds of virtual CPU time. Depending on how busy the system is, the time
slice may take a second or more, resulting in very poor response times for users
logged into that virtual machine. The effect on a real-time operating system can
be even more serious.
The net outcome of such scheduling is that individual virtualized operating
systems receive only a portion of the available CPU cycles, even though they
believe they are receiving all of the cycles and indeed are scheduling all of
the cycles. Commonly, the time-of-day clocks in virtual machines are incorrect
because timers take longer to trigger than they would on dedicated CPUs.
Virtualization can thus undo the scheduling-algorithm efforts of the operating
systems within virtual machines.
To correct for this, the VMM makes an application available for each type of
operating system that the system administrator can install into the guests. This
application corrects clock drift and can have other functions, such as virtual
device management.


## 18.6 Virtualization and Operating-System Components
> id: ch18-18-6 | src: book 18.6 | kind: concept

Memory Management
Efficient memory use in general-purpose operating systems is a major key to
performance. In virtualized environments, there are more users of memory (the
guests and their applications, as well as the VMM), leading to more pressure on
memory use. Further adding to this pressure is the fact that VMMs typically
overcommit memory, so that the total memory allocated to guests exceeds
the amount that physically exists in the system. The extra need for efficient
memory use is not lost on the implementers of VMMs, who take extensive
measures to ensure the optimal use of memory.
For example, VMware ESX uses several methods of memory management.
Before memory optimization can occur, the VMM must establish how much
real memory each guest should use. To do that, the VMM first evaluates each
guest’s maximum memory size. General-purpose operating systems do not
expect the amount of memory in the system to change, so VMMs must maintain
the illusion that the guest has that amount of memory. Next, the VMM computes
a target real-memory allocation for each guest based on the configured memory
for that guest and other factors, such as overcommitment and system load. It
then uses the three low-level mechanisms listed below to reclaim memory from
the guests
1. Recall that a guest believes it controls memory allocation via its page-
table management, whereas in reality the VMM maintains a nested page
table that translates the guest page table to the real page table. The VMM
can use this extra level of indirection to optimize the guest’s use of mem-
ory without the guest’s knowledge or help. One approach is to provide
double paging. Here, the VMM has its own page-replacement algorithms
and loads pages into a backing store that the guest believes is physical
memory. Of course, the VMM knows less about the guest’s memory access
patterns than the guest does, so its paging is less efficient, creating per-
formance problems. VMMs do use this method when other methods are
not available or are not providing enough free memory. However, it is not
the preferred approach.
2. A common solution is for the VMM to install in each guest a pseudo–
device driver or kernel module that the VMM controls. (Apseudo–device
driver uses device-driver interfaces, appearing to the kernel to be a device
driver, but does not actually control a device. Rather, it is an easy way
to add kernel-mode code without directly modifying the kernel.) This
balloon memory manager communicates with the VMM and is told to
allocate or deallocate memory. If told to allocate, it allocates memory
and tells the operating system to pin the allocated pages into physical
memory. Recall that pinning locks a page into physical memory so that it
cannot be moved or paged out. To the guest, these pinned pages appear
to decrease the amount of physical memory it has available, creating
memory pressure. The guest then may free up other physical memory
to be sure it has enough free memory. Meanwhile, the VMM, knowing
that the pages pinned by the balloon process will never be used, removes
those physical pages from the guest and allocates them to another guest.
At the same time, the guest is using its own memory-management and
paging algorithms to manage the available memory, which is the most
Virtual Machines
efficient option. If memory pressure within the entire system decreases,
the VMM will tell the balloon process within the guest to unpin and free
some or all of the memory, allowing the guest more pages for its use.
3. Another common method for reducing memory pressure is for the VMM
to determine if the same page has been loaded more than once. If this
is the case, the VMM reduces the number of copies of the page to one
and maps the other users of the page to that one copy. VMware, for
example, randomly samples guest memory and creates a hash for each
page sampled. That hash value is a “thumbprint” of the page. The hash
of every page examined is compared with other hashes stored in a hash
table. If there is a match, the pages are compared byte by byte to see if they
really are identical. If they are, one page is freed, and its logical address
is mapped to the other’s physical address. This technique might seem
at first to be ineffective, but consider that guests run operating systems.
If multiple guests run the same operating system, then only one copy of
the active operating-system pages need be in memory. Similarly, multiple
guests could be running the same set of applications, again a likely source
of memory sharing.
The overall effect of these mechanisms is to enable guests to behave and
perform as if they had the full amount of memory requested, although in reality
they have less.
I/O
In the area of I/O, hypervisors have some leeway and can be less concerned
with how they represent the underlying hardware to their guests. Because
of the wide variation in I/O devices, operating systems are used to dealing
with varying and flexible I/O mechanisms. For example, an operating system’s
device-driver mechanism provides a uniform interface to the operating sys-
tem whatever the I/O device. Device-driver interfaces are designed to allow
third-party hardware manufacturers to provide device drivers connecting their
devices to the operating system. Usually, device drivers can be dynamically
loaded and unloaded. Virtualization takes advantage of this built-in flexibility
by providing specific virtualized devices to guest operating systems.
As described in Section 18.5, VMMs vary greatly in how they provide I/O
to their guests. I/O devices may be dedicated to guests, for example, or the
VMM may have device drivers onto which it maps guest I/O. The VMM may
also provide idealized device drivers to guests. In this case, the guest sees an
easy-to-control device, but in reality that simple device driver communicates to
the VMM, which sends the requests to a more complicated real device through
a more complex real device driver. I/O in virtual environments is complicated
and requires careful VMM design and implementation.
Consider the case of a hypervisor and hardware combination that allows
devices to be dedicated to a guest and allows the guest to access those devices
directly. Of course, a device dedicated to one guest is not available to any
other guests, but this direct access can still be useful in some circumstances.
The reason to allow direct access is to improve I/O performance. The less the
hypervisor has to do to enable I/O for its guests, the faster the I/O can occur.
With type 0 hypervisors that provide direct device access, guests can often


## 18.6 Virtualization and Operating-System Components
> id: ch18-18-6 | src: book 18.6 | kind: concept

run at the same speed as native operating systems. When type 0 hypervisors
instead provide shared devices, performance may suffer.
With direct device access in type 1 and 2 hypervisors, performance can
be similar to that of native operating systems if certain hardware support
is present. The hardware needs to provide DMA pass-through with facilities
like VT-d, as well as direct interrupt delivery (interrupts going directly to the
guests). Given how frequently interrupts occur, it should be no surprise that
the guests on hardware without these features have worse performance than
if they were running natively.
In addition to direct access, VMMs provide shared access to devices. Con-
sider a disk drive to which multiple guests have access. The VMM must provide
protection while the device is being shared, assuring that a guest can access
only the blocks specified in the guest’s configuration. In such instances, the
VMM must be part of every I/O, checking it for correctness as well as routing
the data to and from the appropriate devices and guests.
In the area of networking, VMMs also have work to do. General-purpose
operating systems typically have one Internet protocol (IP) address, although
they sometimes have more than one—for example, to connect to a manage-
ment network, backup network, and production network. With virtualization,
each guest needs at least one IP address, because that is the guest’s main mode
of communication. Therefore, a server running a VMM may have dozens of
addresses, and the VMM acts as a virtual switch to route the network packets
to the addressed guests.
The guests can be “directly” connected to the network by an IP address
that is seen by the broader network (this is known as bridging). Alternatively,
the VMM can provide a network address translation (NAT) address. The NAT
address is local to the server on which the guest is running, and the VMM
provides routing between the broader network and the guest. The VMM also
provides firewalling to guard connections between guests within the system
and between guests and external systems.
Storage Management
An important question in determining how virtualization works is this: If
multiple operating systems have been installed, what and where is the boot
disk? Clearly, virtualized environments need to approach storage management
differently than do native operating systems. Even the standard multiboot
method of slicing the boot disk into partitions, installing a boot manager in one
partition, and installing each other operating system in another partition is not
sufficient, because partitioning has limits that would prevent it from working
for tens or hundreds of virtual machines.
Once again, the solution to this problem depends on the type of hypervisor.
Type 0 hypervisors often allow root disk partitioning, partly because these
systems tend to run fewer guests than other systems. Alternatively, a disk
manager may be part of the control partition, and that disk manager may
provide disk space (including boot disks) to the other partitions.
Type 1 hypervisors store the guest root disk (and configuration informa-
tion) in one or more files in the file systems provided by the VMM. Type 2
hypervisors store the same information in the host operating system’s file sys-
tems. In essence, a disk image, containing all of the contents of the root disk
Virtual Machines
of the guest, is contained in one file in the VMM. Aside from the potential per-
formance problems that causes, this is a clever solution, because it simplifies
copying and moving guests. If the administrator wants a duplicate of the guest
(for testing, for example), she simply copies the associated disk image of the
guest and tells the VMM about the new copy. Booting the new virtual machine
brings up an identical guest. Moving a virtual machine from one system to
another that runs the same VMM is as simple as halting the guest, copying the
image to the other system, and starting the guest there.
Guests sometimes need more disk space than is available in their root
disk image. For example, a nonvirtualized database server might use several
file systems spread across many disks to store various parts of the database.
Virtualizing such a database usually involves creating several files and having
the VMM present those to the guest as disks. The guest then executes as usual,
with the VMM translating the disk I/O requests coming from the guest into file
I/O commands to the correct files.
Frequently, VMMs provide a mechanism to capture a physical system as
it is currently configured and convert it to a guest that the VMM can manage
and run. This physical-to-virtual (P-to-V) conversion reads the disk blocks of
the physical system’s disks and stores them in files on the VMM’s system or
on shared storage that the VMM can access. VMMs also provide a virtual-to-
physical (V-to-P) procedure for converting a guest to a physical system. This
procedure is sometimes needed for debugging: a problem could be caused by
the VMM or associated components, and the administrator could attempt to
solve the problem by removing virtualization from the problem variables. V-to-
P conversion can take the files containing all of the guest data and generate disk
blocks on a physical disk, recreating the guest as a native operating system and
applications. Once the testing is concluded, the original system can be reused
for other purposes when the virtual machine returns to service, or the virtual
machine can be deleted and the original system can continue to run.
Live Migration
One feature not found in general-purpose operating systems but found in
type 0 and type 1 hypervisors is the live migration of a running guest from
one system to another. We mentioned this capability earlier. Here, we explore
the details of how live migration works and why VMMs can implement it
relatively easily while general-purpose operating systems, in spite of some
research attempts, cannot.
First, let’s consider how live migration works. A running guest on one
system is copied to another system running the same VMM. The copy occurs
with so little interruption of service that users logged in to the guest, as well
as network connections to the guest, continue without noticeable impact. This
rather astonishing ability is very powerful in resource management and hard-
ware administration. After all, compare it with the steps necessary without
virtualization: we must warn users, shut down the processes, possibly move
the binaries, and restart the processes on the new system. Only then can users
access the services again. With live migration, we can decrease the load on an
overloaded system or make hardware or system changes with no discernable
disruption for users.


## 18.6 Virtualization and Operating-System Components
> id: ch18-18-6 | src: book 18.6 | kind: concept

Live migration is made possible by the well-defined interface between each
guest and the VMM and the limited state the VMM maintains for the guest. The
VMM migrates a guest via the following steps:
1. The source VMM establishes a connection with the target VMM and con-
firms that it is allowed to send a guest.
2. The target creates a new guest by creating a new VCPU, new nested page
table, and other state storage.
3. The source sends all read-only memory pages to the target.
4. The source sends all read–write pages to the target, marking them as
clean.
5. The source repeats step 4, because during that step some pages were
probably modified by the guest and are now dirty. These pages need to
be sent again and marked again as clean.
6. When the cycle of steps 4 and 5 becomes very short, the source VMM
freezes the guest, sends the VCPU’s final state, other state details, and the
final dirty pages, and tells the target to start running the guest. Once the
target acknowledges that the guest is running, the source terminates the
guest.
This sequence is shown in Figure 18.8.
We conclude this discussion with a few interesting details and limitations
concerning live migration. First, for network connections to continue uninter-
rupted, the network infrastructure needs to understand that a MAC address—
the hardware networking address—can move between systems. Before virtu-
alization, this did not happen, as the MAC address was tied to physical hard-
ware. With virtualization, the MAC must be movable for existing networking
connections to continue without resetting. Modern network switches under-
stand this and route traffic wherever the MAC address is, even accommodating
a move.
guest target running
5 – send dirty pages (repeatedly)
4 – send R/W pages
3 – send R/O pages
1 – establish
0 – running
guest source
VMM source
7 – terminate
guest source
VMM target
2 – create
guest target
6 – running
guest target
Figure 18.8
Live migration of a guest between two servers.
Virtual Machines
Alimitation of live migration is that no disk state is transferred. One reason
live migration is possible is that most of the guest’s state is maintained within
the guest—for example, open file tables, system-call state, kernel state, and
so on. Because disk I/O is much slower than memory access, however, and
used disk space is usually much larger than used memory, disks associated
with the guest cannot be moved as part of a live migration. Rather, the disk
must be remote to the guest, accessed over the network. In that case, disk
access state is maintained within the guest, and network connections are all
that matter to the VMM. The network connections are maintained during the
migration, so remote disk access continues. Typically, NFS, CIFS, or iSCSI is used
to store virtual machine images and any other storage a guest needs access
to. These network-based storage accesses simply continue when the network
connections are continued once the guest has been migrated.
Live migration makes it possible to manage data centers in entirely new
ways. For example, virtualization management tools can monitor all the VMMs
in an environment and automatically balance resource use by moving guests
between the VMMs. These tools can also optimize the use of electricity and
cooling by migrating all guests off selected servers if other servers can handle
the load and powering down the selected servers entirely. If the load increases,
the tools can power up the servers and migrate guests back to them.


## 18.7 Examples
> id: ch18-18-7 | src: book 18.7; slides 45-48 | kind: concept

Despite the advantages of virtual machines, they received little attention for
a number of years after they were first developed. Today, however, virtual
machines are coming into greater use as a means of solving system compat-
ibility problems. In this section, we explore two popular contemporary virtual
machines: the VMware Workstation and the Java virtual machine. These virtual
machines can typically run on top of operating systems of any of the design
types discussed in earlier chapters.
VMware
VMware Workstation is a popular commercial application that abstracts Intel
x86 and compatible hardware into isolated virtual machines. VMware Work-
station is a prime example of a Type 2 hypervisor. It runs as an application on a
host operating system such as Windows or Linux and allows this host system
to run several different guest operating systems concurrently as independent
virtual machines.
The architecture of such a system is shown in Figure 18.9. In this scenario,
Linux is running as the host operating system, and FreeBSD, Windows NT, and
Windows XP are running as guest operating systems. At the heart of VMware
is the virtualization layer, which abstracts the physical hardware into isolated
virtual machines running as guest operating systems. Each virtual machine has
its own virtual CPU, memory, disk drives, network interfaces, and so forth.
The physical disk that the guest owns and manages is really just a file
within the file system of the host operating system. To create an identical guest,
we can simply copy the file. Copying the file to another location protects the
guest against a disaster at the original site. Moving the file to another location


**Examples - VMware**

- VMware Workstation runs on x86, provides VMM for guests
- Runs as application on other native, installed host operating system -> Type 2
- Lots of guests possible, including Windows, Linux, etc. all runnable concurrently (as resources allow)
- Virtualization layer abstracts underlying HW, providing guest with is own virtual CPUs, memory, disk drives, network interfaces, etc.
- Physical disks can be provided to guests, or virtual physical disks (just files within host file system)


**VMware Workstation Architecture**



> **[ASSET ch18_ill_009]** Figure from slide 46
> - type: illustration
> - kind: other
> - file: assets/ch18_slide46_img009.png
> - src: slides 46
> - shows: Illustration from slide 46
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Examples – Java Virtual Machine**

- Example of programming-environment virtualization
- Very popular language / application environment invented by Sun Microsystems in 1995
- Write once, run anywhere
- Includes language specification (Java), API library, Java virtual machine (JVM)
- Java objects specified by class construct, Java program is one or more objects
- Each Java object compiled into architecture-neutral bytecode output (.class) which JVM class loader loads
- JVM compiled per architecture, reads bytecode and executes
- Includes garbage collection to reclaim memory no longer in use
- Made faster by just-in-time (JIT) compiler that turns bytecodes into native code and caches them


**The Java Virtual Machine**



> **[ASSET ch18_ill_010]** Figure from slide 48
> - type: illustration
> - kind: other
> - file: assets/ch18_slide48_img010.png
> - src: slides 48
> - shows: Illustration from slide 48
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 18.7 Examples
> id: ch18-18-7 | src: book 18.7 | kind: concept

virtualization layer
host operating system
(Linux)
CPU
memory
hardware
I/O devices
application
application
application
application
guest operating
system
(free BSD)
virtual CPU
virtual memory
virtual devices
guest operating
system
(Windows NT)
virtual CPU
virtual memory
virtual devices
guest operating
system
(Windows XP)
virtual CPU
virtual memory
virtual devices
Figure 18.9
VMware Workstation architecture.
moves the guest system. Such capabilities, as explained earlier, can improve
the efficiency of system administration as well as system resource use.
The Java Virtual Machine
Java is a popular object-oriented programming language introduced by Sun
Microsystems in 1995. In addition to a language specification and a large
API library, Java provides a specification for a Java virtual machine, or JVM.
Java therefore is an example of programming-environment virtualization, as
discussed in Section 18.5.6.
Java objects are specified with the class construct; a Java program con-
sists of one or more classes. For each Java class, the compiler produces an
architecture-neutral bytecode output (.class) file that will run on any imple-
mentation of the JVM.
The JVM is a specification for an abstract computer. It consists of a class
loader and a Java interpreter that executes the architecture-neutral bytecodes,
as diagrammed in Figure 18.10. The class loader loads the compiled .class
files from both the Java program and the Java API for execution by the Java
interpreter. After a class is loaded, the verifier checks that the .class file is
valid Java bytecode and that it does not overflow or underflow the stack. It also
ensures that the bytecode does not perform pointer arithmetic, which could
provide illegal memory access. If the class passes verification, it is run by the
Java interpreter. The JVM also automatically manages memory by performing
garbage collection—the practice of reclaiming memory from objects no longer
in use and returning it to the system. Much research focuses on garbage collec-
tion algorithms for increasing the performance of Java programs in the virtual
machine.
Virtual Machines
host system
(Windows, Linux, etc.)
class loader
Java
interpreter
Java program
.class files
Java API
.class files
Figure 18.10
The Java virtual machine.
The JVM may be implemented in software on top of a host operating
system, such as Windows, Linux, or macOS, or as part of a web browser.
Alternatively, the JVM may be implemented in hardware on a chip specifically
designed to run Java programs. If the JVM is implemented in software, the
Java interpreter interprets the bytecode operations one at a time. A faster
software technique is to use a just-in-time (JIT) compiler. Here, the first time
a Java method is invoked, the bytecodes for the method are turned into native
machine language for the host system. These operations are then cached so that
subsequent invocations of a method are performed using the native machine
instructions, and the bytecode operations need not be interpreted all over
again. Running the JVM in hardware is potentially even faster. Here, a special
Java chip executes the Java bytecode operations as native code, thus bypassing
the need for either a software interpreter or a just-in-time compiler.


## 18.8 Virtualization Research
> id: ch18-18-8 | src: book 18.8; slides 49-51 | kind: concept

As mentioned earlier, machine virtualization has enjoyed growing popularity
in recent years as a means of solving system compatibility problems. Research
has expanded to cover many other uses of machine virtualization, including
support for microservices running on library operating systems and secure
partitioning of resources in embedded systems. Consequently, quite a lot of
interesting, active research is underway.
Frequently, in the context of cloud computing, the same application
is run on thousands of systems. To better manage those deployments,
they can be virtualized. But consider the execution stack in that case—the
application on top of a service-rich general-purpose operating system within
a virtual machine managed by a hypervisor. Projects like unikernels, built
on library operating systems, aim to improve efficiency and security in these
environments. Unikernels are specialized machine images, using one address
space, that shrink the attack surface and resource footprint of deployed
applications. In essence, they compile the application, the system libraries it
calls, and the kernel services it uses into a single binary that runs within a
virtual environment (or even on bare metal). While research into changing
how operating system kernels, hardware, and applications interact is not new
(see https://pdos.csail.mit.edu/6.828/2005/readings/engler95exokernel.pdf,


- Very popular technology with active research
- Driven by uses such as server consolidation
- Unikernels, built on library operating systems
  - Aim to improve efficiency and security
  - Specialized machine images using one address space, shrinking attack surface and resource footprint of deployed applications
  - In essence, compile application, libraries called, and used kernel services into single binary that runs in a virtual environment
- Better control of processes available via projects like Quest-V
  - Real time execution and fault tolerance via virtualization instructions
  - Partitioning hypervisors partition physical resources amongst guests, fully-committing all resources (rather than overcommitting)
  - For example a Linux system that lacks real-time capabilities for safety- and security-critical tasks can be extended with a lightweight real-time OS running in its own VM


**Virtualization Research (Cont.)**

- Separation hypervisors like Quest-V, each task runs in a virtual machine
  - Hypervisor initializes system and starts tasks but not involved in continuing operation
  - Each VM has its own resources the task manages
  - Tasks can be real time and more secure
  - Other examples are Xtratum, Siemens Jailhouse
  - Can build chip-level distributed system
  - Secure shared memory channels implemented via extended page tables for inter-task communication
  - Project targets include robotics, self-driving cars, Internet of Things


**End of Chapter 18**



## 18.9 Summary
> id: ch18-18-9 | src: book 18.9 | kind: concept

for example), cloud computing and virtualization have created renewed
interest in the area. See http://unikernel.org for more details.
The virtualization instructions in modern CPUs have given rise to a new
branch of virtualization research focusing not on more efficient use of hardware
but rather on better control of processes. Partitioning hypervisors partition the
existing machine physical resources amongst guests, thereby fully committing
rather than overcommitting machine resources. Partitioning hypervisors can
securely extend the features of an existing operating system via functionality
in another operating system (run in a separate guest VM domain), running on
a subset of machine physical resources. This avoids the tedium of writing an
entire operating system from scratch. For example, a Linux system that lacks
real-time capabilities for safety- and security-critical tasks can be extended with
a lightweight real-time operating system running in its own virtual machine.
Traditional hypervisors have higher overhead than running native tasks, so a
new type of hypervisor is needed.
Each task runs within a virtual machine, but the hypervisor only initializes
the system and starts the tasks and is not involved with continuing operation.
Each virtual machine has its own allocated hardware and is free to manage that
hardware without interference from the hypervisor. Because the hypervisor
does not interrupt task operations and is not called by the tasks, the tasks can
have real-time aspects and can be much more secure.
Within the class of partitioning hypervisors are the Quest-V, eVM,
Xtratum and Siemens Jailhouse projects. These are separation hypervisors
(see
http://www.csl.sri.com/users/rushby/papers/sosp81.pdf)
that
use
virtualization to partition separate system components into a chip-level
distributed system. Secure shared memory channels are then implemented
using hardware extended page tables so that separate sandboxed guests
can communicate with one another. The targets of these projects are
areas such as robotics, self-driving cars, and the Internet of Things. See
https://www.cs.bu.edu/richwest/papers/west-tocs16.pdf for more details.


## 18.9 Summary
> id: ch18-18-9 | src: book 18.9 | kind: concept

• Virtualization is a method for providing a guest with a duplicate of a
system’s underlying hardware. Multiple guests can run on a given system,
each believing that it is the native operating system and is in full control.
• Virtualization started as a method to allow IBM to segregate users and
provide them with their own execution environments on IBM mainframes.
Since then, thanks to improvements in system and CPU performance and
innovative software techniques, virtualization has become a common fea-
ture in data centers and even on personal computers. Because of its pop-
ularity, CPU designers have added features to support virtualization. This
snowball effect is likely to continue, with virtualization and its hardware
support increasing over time.
• The virtual machine manager, or hypervisor, creates and runs the virtual
machine. Type 0 hypervisors are implemented in the hardware and require
modifications to the operating system to ensure proper operation. Some
Virtual Machines
type 0 hypervisors offer an example of paravirtualization, in which the
operating system is aware of virtualization and assists in its execution.
• Type 1 hypervisors provide the environment and features needed to cre-
ate, run, and manage guest virtual machines. Each guest includes all of
the software typically associated with a full native system, including the
operating system, device drivers, applications, user accounts, and so on.
• Type 2 hypervisors are simply applications that run on other operating
systems, which do not know that virtualization is taking place. These
hypervisors do not have hardware or host support so must perform all
virtualization activities in the context of a process.
• Programming-environment virtualization is part of the design of a pro-
gramming language. The language specifies a containing application in
which programs run, and this application provides services to the pro-
grams.
• Emulation is used when a host system has one architecture and the guest
was compiled for a different architecture. Every instruction the guest
wants to execute must be translated from its instruction set to that of
the native hardware. Although this method involves some performance
penalty, it is balanced by the usefulness of being able to run old programs
on newer, incompatible hardware or run games designed for old consoles
on modern hardware.
• Implementing virtualization is challenging, especially when hardware
support is minimal. The more features provided by the system, the easier
virtualization is to implement and the better the performance of the guests.
• VMMs take advantage of whatever hardware support is available when
optimizing CPU scheduling, memory management, and I/O modules to
provide guests with optimum resource use while protecting the VMM from
the guests and the guests from one another.
• Current research is extending the uses of virtualization. Unikernels aim to
increase efficiency and decrease security attack surface by compiling an
application, its libraries, and the kernel resources the application needs
into one binary with one address space that runs within a virtual machine.
Partitioning hypervisors provide secure execution, real-time operation,
and other features traditionally only available to applications running on
dedicated hardware.
Further Reading
The original IBM virtual machine is described in [Meyer and Seawright (1970)].
[Popek and Goldberg (1974)] established the characteristics that help define
VMMs. Methods of implementing virtual machines are discussed in [Agesen
et al. (2010)].
Intel x86 hardware virtualization support is described in [Neiger et al.
(2006)]. AMD hardware virtualization support is described in a white paper
available at http://developer.amd.com/assets/NPT-WP-1%201-ﬁnal-TM.pdf.
Bibliography
Memory management in VMware is described in [Waldspurger (2002)].
[Gordon et al. (2012)] propose a solution to the problem of I/O overhead in
virtualized environments. Some protection challenges and attacks in virtual
environments are discussed in [Wojtczuk and Ruthkowska (2011)].
For early work on alternative kernel designs, see https://pdos.csail.mit.edu
/6.828/2005/readings/engler95exokernel.pdf. For more on unikernels, see
[West et al. (2016)] and http://unikernel.org. Partitioning hypervisors are dis-
cussed in http://ethdocs.org/en/latest/introduction/what-is-ethereum.html,
and https://lwn.net/Articles/578295 and [Madhavapeddy et al. (2013)]. Quest-
V, a separation hypervisor, is detailed in http://www.csl.sri.com/users/rushby/
papers/sosp81.pdf and https://www.cs.bu.edu/ richwest/papers/west-tocs16
.pdf.
The open-source VirtualBox project is available from http://www.virtualbox
.org. The source code for LXC is available at https://linuxcontainers.org/lxc/dow
nloads.
For more on docker, see https://www.docker.com/what-docker. Informa-
tion about Kubernetes can be found at https://kubernetes.io/docs/concepts/ov
erview/what-is-kubernetes.
Bibliography
[Agesen et al. (2010)]
O. Agesen, A. Garthwaite, J. Sheldon, and P. Subrah-
manyam, “The Evolution of an x86 Virtual Machine Monitor”, Proceedings of the
ACM Symposium on Operating Systems Principles (2010), pages 3–18.
[Gordon et al. (2012)]
A. Gordon, N. A. N. Har’El, M. Ben-Yehuda, A. Landau,
A. Schuster, and D. Tsafrir, “ELI: Bare-metal Performance for I/O Virtualization”,
Proceedings of the International Conference on Architectural Support for Programming
Languages and Operating Systems (2012), pages 411–422.
[Madhavapeddy et al. (2013)]
A. Madhavapeddy, R. Mirtier, C. Rotsos, D. Scott,
B. Singh, T. Gazagnaire, S. Smith, S. Hand, and J. Crowcroft, “Unikernels: Library
Operating Systems for the Cloud” (2013).
[Meyer and Seawright (1970)]
R. A. Meyer and L. H. Seawright, “A Virtual
Machine Time-Sharing System”, IBM Systems Journal, Volume 9, Number 3
(1970), pages 199–218.
[Neiger et al. (2006)]
G. Neiger, A. Santoni, F. Leung, D. Rodgers, and R. Uhlig,
“Intel Virtualization Technology: Hardware Support for Efficient Processor Vir-
tualization”, Intel Technology Journal, Volume 10, (2006).
[Popek and Goldberg (1974)]
G. J. Popek and R. P. Goldberg, “Formal Require-
ments for Virtualizable Third Generation Architectures”, Communications of the
ACM, Volume 17, Number 7 (1974), pages 412–421.
[Waldspurger (2002)]
C. Waldspurger, “Memory Resource Management in
VMware ESX Server”, Operating Systems Review, Volume 36, Number 4 (2002),
pages 181–194.
[West et al. (2016)]
R. West, Y. Li, E. Missimer, and M. Danish, “A Virtualized
Separation Kernel for Mixed Criticality Systems”, Volume 34, (2016).
Virtual Machines
[Wojtczuk and Ruthkowska (2011)]
R. Wojtczuk and J. Ruthkowska, “Follow-
ing the White Rabbit: Software Attacks Against Intel VT-d Technology”, The
Invisible Things Lab’s blog (2011).


## 18.1 Describe the three types of traditional hypervisors.
> id: ch18-18-1 | src: book 18.1 | kind: concept




## 18.2 Describe four virtualization-like execution environments, and explain
> id: ch18-18-2 | src: book 18.2 | kind: concept

how they differ from “true” virtualization.


## 18.3 Describe four benefits of virtualization.
> id: ch18-18-3 | src: book 18.3 | kind: concept




## 18.4 Why are VMMs unable to implement trap-and-emulate-based virtual-
> id: ch18-18-4 | src: book 18.4 | kind: concept

ization on some CPUs? Lacking the ability to trap and emulate, what
method can a VMM use to implement virtualization?


## 18.5 What hardware assistance for virtualization can be provided by mod-
> id: ch18-18-5 | src: book 18.5 | kind: concept

ern CPUs?


## 18.6 Why is live migration possible in virtual environments but much less
> id: ch18-18-6 | src: book 18.6 | kind: concept

possible for a native operating system?
EX-55

