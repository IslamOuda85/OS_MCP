---
doc_type: scientific_content
course_id: operating_systems
chapter: 10
chapter_id: operating_systems_ch10
chapter_title: Chapter 10
textbook: "Operating System Concepts (Silberschatz, Galvin, Gagne)"
textbook_edition: "10th"
language: en
syllabus_applied: false
sources:
  - {role: book, file: "Abraham-Silberschatz-Operating-System-Concepts-10th-2018-501-569.pdf", pages: "TBD"}
  - {role: slides, file: "ch10 (1).pptx", slides: "1-86"}
assets_dir: assets
asset_counts: {"table_image": 0, "text_table": 0, "illustration": 28, "equation": 0, "graph": 6, "picture": 0, "code_image": 0, "text_image": 0, "total": 34}
spec_version: "1.0"
generated_at: "2026-09-30T00:00:00Z"
status: complete
---

# Chapter 10

> id: ch10-intro | src: book introduction; slides 1-3 | kind: concept

C H A P T E R
Virtual
Memory
In Chapter 9, we discussed various memory-management strategies used in
computer systems. All these strategies have the same goal: to keep many
processes in memory simultaneously to allow multiprogramming. However,
they tend to require that an entire process be in memory before it can execute.
Virtual memory is a technique that allows the execution of processes that
are not completely in memory. One major advantage of this scheme is that pro-
grams can be larger than physical memory. Further, virtual memory abstracts
main memory into an extremely large, uniform array of storage, separating
logical memory as viewed by the programmer from physical memory. This
technique frees programmers from the concerns of memory-storage limita-
tions. Virtual memory also allows processes to share files and libraries, and
to implement shared memory. In addition, it provides an efficient mechanism
for process creation. Virtual memory is not easy to implement, however, and
may substantially decrease performance if it is used carelessly. In this chap-
ter, we provide a detailed overview of virtual memory, examine how it is
implemented, and explore its complexity and benefits.
CHAPTER OBJECTIVES
• Define virtual memory and describe its benefits.
• Illustrate how pages are loaded into memory using demand paging.
• Apply the FIFO, optimal, and LRU page-replacement algorithms.
• Describe the working set of a process, and explain how it is related to
program locality.
• Describe how Linux, Windows 10, and Solaris manage virtual memory.
• Design a virtual memory manager simulation in the C programming lan-
guage.


**Chapter 10:  Virtual Memory**



**Chapter 10:  Virtual Memory**

- Background
- Demand Paging
- Copy-on-Write
- Page Replacement
- Allocation of Frames
- Thrashing
- Memory-Mapped Files
- Allocating Kernel Memory
- Other Considerations
- Operating-System Examples


**Objectives**

- Define virtual memory and describe its benefits.
- Illustrate how pages are loaded into memory using demand paging.
- Apply the FIFO, optimal, and  LRU page-replacement algorithms.
- Describe the working set of a process, and explain how it is related to program locality.
- Describe how Linux, Windows 10, and Solaris manage virtual memory.
- Design a virtual memory manager simulation in the C programming language.


## 10.1 Background
> id: ch10-10-1 | src: book 10.1; slides 4-4 | kind: concept

The memory-management algorithms outlined in Chapter 9 are necessary
because of one basic requirement: the instructions being executed must be in
Virtual Memory
physical memory. The first approach to meeting this requirement is to place
the entire logical address space in physical memory. Dynamic linking can help
to ease this restriction, but it generally requires special precautions and extra
work by the programmer.
The requirement that instructions must be in physical memory to be exe-
cuted seems both necessary and reasonable; but it is also unfortunate, since it
limits the size of a program to the size of physical memory. In fact, an exami-
nation of real programs shows us that, in many cases, the entire program is not
needed. For instance, consider the following:
• Programs often have code to handle unusual error conditions. Since these
errors seldom, if ever, occur in practice, this code is almost never executed.
• Arrays, lists, and tables are often allocated more memory than they actu-
ally need. An array may be declared 100 by 100 elements, even though it
is seldom larger than 10 by 10 elements.
• Certain options and features of a program may be used rarely. For instance,
the routines on U.S. government computers that balance the budget have
not been used in many years.
Even in those cases where the entire program is needed, it may not all be
needed at the same time.
The ability to execute a program that is only partially in memory would
confer many benefits:
• A program would no longer be constrained by the amount of physical
memory that is available. Users would be able to write programs for an
extremely large virtual address space, simplifying the programming task.
• Because each program could take less physical memory, more programs
could be run at the same time, with a corresponding increase in CPU utiliza-
tion and throughput but with no increase in response time or turnaround
time.
• Less I/O would be needed to load or swap portions of programs into
memory, so each program would run faster.
Thus, running a program that is not entirely in memory would benefit both the
system and its users.
Virtual memory involves the separation of logical memory as perceived
by developers from physical memory. This separation allows an extremely
large virtual memory to be provided for programmers when only a smaller
physical memory is available (Figure 10.1). Virtual memory makes the task of
programming much easier, because the programmer no longer needs to worry
about the amount of physical memory available; she can concentrate instead
on programming the problem that is to be solved.
The virtual address space of a process refers to the logical (or virtual) view
of how a process is stored in memory. Typically, this view is that a process
begins at a certain logical address—say, address 0—and exists in contiguous
memory, as shown in Figure 10.2. Recall from Chapter 9, though, that in fact
physical memory is organized in page frames and that the physical page
frames assigned to a process may not be contiguous. It is up to the memory-


- Code needs to be in memory to execute, but entire program rarely used
  - Error code, unusual routines, large data structures
- Entire program code not needed at same time
- Consider ability to execute partially-loaded program
  - Program no longer constrained by limits of physical memory
  - Each program takes less memory while running -> more programs run at the same time
    - Increased CPU utilization and throughput with no increase in response time or turnaround time
  - Less I/O needed to load or swap programs into memory -> each user program runs faster


## 10.1 Background
> id: ch10-10-1 | src: book 10.1 | kind: concept

virtual
memory
memory
map
physical
memory
backing store
•
•
•
page 0
page 1
page 2
page v
Figure 10.1
Diagram showing virtual memory that is larger than physical memory.
management unit (MMU) to map logical pages to physical page frames in
memory.
Note in Figure 10.2 that we allow the heap to grow upward in memory as
it is used for dynamic memory allocation. Similarly, we allow for the stack to
grow downward in memory through successive function calls. The large blank
space (or hole) between the heap and the stack is part of the virtual address
space but will require actual physical pages only if the heap or stack grows.
Virtual address spaces that include holes are known as sparse address spaces.
Using a sparse address space is beneficial because the holes can be filled as the
stack or heap segments grow or if we wish to dynamically link libraries (or
possibly other shared objects) during program execution.
text
max
data
heap
stack
Figure 10.2
Virtual address space of a process in memory.
Virtual Memory
shared library
stack
shared
pages
text
data
heap
text
data
heap
shared library
stack
Figure 10.3
Shared library using virtual memory.
In addition to separating logical memory from physical memory, virtual
memory allows files and memory to be shared by two or more processes
through page sharing (Section 9.3.4). This leads to the following benefits:
• System libraries such as the standard C library can be shared by several
processes through mapping of the shared object into a virtual address
space. Although each process considers the libraries to be part of its vir-
tual address space, the actual pages where the libraries reside in physical
memory are shared by all the processes (Figure 10.3). Typically, a library is
mapped read-only into the space of each process that is linked with it.
• Similarly, processes can share memory. Recall from Chapter 3 that two
or more processes can communicate through the use of shared memory.
Virtual memory allows one process to create a region of memory that it can
share with another process. Processes sharing this region consider it part
of their virtual address space, yet the actual physical pages of memory are
shared, much as is illustrated in Figure 10.3.
• Pages can be shared during process creation with the fork() system call,
thus speeding up process creation.
We further explore these—and other—benefits of virtual memory later in
this chapter. First, though, we discuss implementing virtual memory through
demand paging.


## 10.2 Demand Paging
> id: ch10-10-2 | src: book 10.2; slides 10-82 | kind: concept

Consider how an executable program might be loaded from secondary storage
into memory. One option is to load the entire program in physical memory
at program execution time. However, a problem with this approach is that


- Could bring entire process into memory at load time
- Or bring a page into memory only when it is needed
  - Less I/O needed, no unnecessary I/O
  - Less memory needed
  - Faster response
  - More users
- Similar to paging system with swapping (diagram on right)
- Page is needed  reference to it
  - invalid reference  abort
  - not-in-memory  bring to memory
- Lazy swapper – never swaps a page into memory unless page will be needed
  - Swapper that deals with pages is a pager


- Could bring entire process into memory at load time
- Or bring a page into memory only when it is needed
  - Less I/O needed, no unnecessary I/O
  - Less memory needed
  - Faster response
  - More users
- Similar to paging system with swapping (diagram on right)


> **[ASSET ch10_ill_001]** Figure from slide 11
> - type: illustration
> - kind: other
> - file: assets/ch10_slide11_img004.jpg
> - src: slides 11
> - shows: Illustration from slide 11
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Basic Concepts**

- With swapping, pager guesses which pages will be used before swapping out again
- Instead, pager brings in only those pages into memory
- How to determine that set of pages?
  - Need new MMU functionality to implement demand paging
- If pages needed are already memory resident
  - No difference from non demand-paging
- If page needed and not memory resident
  - Need to detect and load the page into memory from storage
    - Without changing program behavior
    - Without programmer needing to change code


**Valid-Invalid Bit**

- With each page table entry a valid–invalid bit is associated(v  in-memory – memory resident, i  not-in-memory)
- Initially valid–invalid bit is set to i on all entries
- Example of a page table snapshot:
- During MMU address translation, if valid–invalid bit in page table entry is i  page fault


> **[ASSET ch10_ill_002]** Figure from slide 13
> - type: illustration
> - kind: other
> - file: assets/ch10_slide13_img005.jpg
> - src: slides 13
> - shows: Illustration from slide 13
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Page Table When Some Pages Are Notin Main Memory**



> **[ASSET ch10_ill_003]** Figure from slide 14
> - type: illustration
> - kind: other
> - file: assets/ch10_slide14_img006.jpg
> - src: slides 14
> - shows: Illustration from slide 14
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Steps in Handling Page Fault**

- If there is a reference to a page, first reference to that page will trap to operating system
  - Page fault
- Operating system looks at another table to decide:
  - Invalid reference  abort
  - Just not in memory
- Find free frame
- Swap page into frame via scheduled disk operation
- Reset tables to indicate page now in memorySet validation bit = v
- Restart the instruction that caused the page fault


**Steps in Handling a Page Fault (Cont.)**



> **[ASSET ch10_ill_004]** Figure from slide 16
> - type: illustration
> - kind: other
> - file: assets/ch10_slide16_img007.jpg
> - src: slides 16
> - shows: Illustration from slide 16
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Aspects of Demand Paging**

- Extreme case – start process with no pages in memory
  - OS sets instruction pointer to first instruction of process, non-memory-resident -> page fault
  - And for every other process pages on first access
  - Pure demand paging
- Actually, a given instruction could access multiple pages -> multiple page faults
  - Consider fetch and decode of instruction which adds 2 numbers from memory and stores result back to memory
  - Pain decreased because of locality of reference
- Hardware support needed for demand paging
  - Page table with valid / invalid bit
  - Secondary memory (swap device with swap space)
  - Instruction restart


**Instruction Restart**

- Consider an instruction that could access several different locations
  - Block move
  - Auto increment/decrement location
  - Restart the whole operation?
    - What if source and destination overlap?


> **[ASSET ch10_ill_005]** Figure from slide 18
> - type: illustration
> - kind: other
> - file: assets/ch10_slide18_img008.jpg
> - src: slides 18
> - shows: Illustration from slide 18
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Free-Frame List**

- When a page fault occurs, the operating system must bring the desired page from secondary storage into main memory.
- Most operating systems maintain a  free-frame list -- a pool of free frames for satisfying such requests.
- Operating system typically allocate free frames using a technique known as zero-fill-on-demand --  the content of the frames zeroed-out before being allocated.
- When a system starts up, all available memory is placed on the free-frame list.


> **[ASSET ch10_ill_006]** Figure from slide 19
> - type: illustration
> - kind: other
> - file: assets/ch10_slide19_img009.jpg
> - src: slides 19
> - shows: Illustration from slide 19
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Stages in Demand Paging – Worse Case**

- Trap to the operating system
- Save the user registers and process state
- Determine that the interrupt was a page fault
- Check that the page reference was legal and determine the location of the page on the disk
- Issue a read from the disk to a free frame:
  - Wait in a queue for this device until the read request is serviced
  - Wait for the device seek and/or latency time
  - Begin the transfer of the page to a free frame


**Stages in Demand Paging  (Cont.)**

- While waiting, allocate the CPU to some other user
- Receive an interrupt from the disk I/O subsystem (I/O   completed)
- Save the registers and process state for the other user
- Determine that the interrupt was from the disk
- Correct the page table and other tables to show page is now in memory
- Wait for the CPU to be allocated to this process again
- Restore the user registers, process state, and new page table, and then
- resume the interrupted instruction


**Performance of Demand Paging**

- Three major activities
  - Service the interrupt – careful coding means just several hundred instructions needed
  - Read the page – lots of time
  - Restart the process – again just a small amount of time
- Page Fault Rate 0  p  1
  - if p = 0 no page faults
  - if p = 1, every reference is a fault
- Effective Access Time (EAT)
- EAT = (1 – p) x memory access
- + p (page fault overhead
- + swap page out
- + swap page in )


**Demand Paging Example**

- Memory access time = 200 nanoseconds
- Average page-fault service time = 8 milliseconds
- EAT = (1 – p) x 200 + p (8 milliseconds)
- = (1 – p  x 200 + p x 8,000,000
- = 200 + p x 7,999,800
- If one access out of 1,000 causes a page fault, then
- EAT = 8.2 microseconds.
- This is a slowdown by a factor of 40!!
- If want performance degradation < 10 percent
  - 220 > 200 + 7,999,800 x p20 > 7,999,800 x p
  - p < .0000025
  - < one page fault in every 400,000 memory accesses


**Demand Paging Optimizations**

- Swap space I/O faster than file system I/O even if on the same device
  - Swap allocated in larger chunks, less management needed than file system
- Copy entire process image to swap space at process load time
  - Then page in and out of swap space
  - Used in older BSD Unix
- Demand page in from program binary on disk, but discard rather than paging out when freeing frame
  - Used in Solaris and current BSD
  - Still need to write to swap space
    - Pages not associated with a file (like stack and heap) – anonymous memory
    - Pages modified in memory but not yet written back to the file system
- Mobile systems
  - Typically don’t support swapping
  - Instead, demand page from file system and reclaim read-only pages (such as code)


**Demand Paging and Thrashing**

- Why does demand paging work?
- Locality model
  - Process migrates from one locality to another
  - Localities may overlap
- Why does thrashing occur?
-  size of locality > total memory size
- Limit effects by using local or priority page replacement


**Locality In A Memory-Reference Pattern**



> **[ASSET ch10_ill_007]** Figure from slide 58
> - type: illustration
> - kind: other
> - file: assets/ch10_slide58_img024.png
> - src: slides 58
> - shows: Illustration from slide 58
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Working-Set Model**

-   working-set window  a fixed number of page references Example:  10,000 instructions
- WSSi (working set of Process Pi) =  total number of pages referenced in the most recent  (varies in time)
  - if  too small will not encompass entire locality
  - if  too large will encompass several localities
  - if  =   will encompass entire program
- D =  WSSi  total demand frames
  - Approximation of locality


**Working-Set Model (Cont.)**

- if D > m  Thrashing
- Policy if D > m, then suspend or swap out one of the processes


> **[ASSET ch10_ill_008]** Figure from slide 60
> - type: illustration
> - kind: other
> - file: assets/ch10_slide60_img025.png
> - src: slides 60
> - shows: Illustration from slide 60
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Keeping Track of the Working Set**

- Approximate with interval timer + a reference bit
- Example:  = 10,000
  - Timer interrupts after every 5000 time units
  - Keep in memory 2 bits for each page
  - Whenever a timer interrupts copy and sets the values of all reference bits to 0
  - If one of the bits in memory = 1  page in working set
- Why is this not completely accurate?
- Improvement = 10 bits and interrupt every 1000 time units


**Page-Fault Frequency**

- More direct approach than WSS
- Establish “acceptable” page-fault frequency (PFF) rate and use local replacement policy
  - If actual rate too low, process loses frame
  - If actual rate too high, process gains frame


> **[ASSET ch10_ill_009]** Figure from slide 62
> - type: illustration
> - kind: other
> - file: assets/ch10_slide62_img026.png
> - src: slides 62
> - shows: Illustration from slide 62
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Working Sets and Page Fault Rates**

- Direct relationship between working set of a process and its page-fault rate
- Working set changes over time
- Peaks and valleys over time


> **[ASSET ch10_ill_010]** Figure from slide 63
> - type: illustration
> - kind: other
> - file: assets/ch10_slide63_img027.jpg
> - src: slides 63
> - shows: Illustration from slide 63
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Performance of Demand Paging**

- Stages in Demand Paging (worse case)
- Trap to the operating system
- Save the user registers and process state
- Determine that the interrupt was a page fault
- Check that the page reference was legal and determine the location of the page on the disk
- Issue a read from the disk to a free frame:
  - Wait in a queue for this device until the read request is serviced
  - Wait for the device seek and/or latency time
  - Begin the transfer of the page to a free frame
- While waiting, allocate the CPU to some other user
- Receive an interrupt from the disk I/O subsystem (I/O completed)
- Save the registers and process state for the other user
- Determine that the interrupt was from the disk
- Correct the page table and other tables to show page is now in memory
- Wait for the CPU to be allocated to this process again
- Restore the user registers, process state, and new page table, and then resume the interrupted instruction


## 10.2 Demand Paging
> id: ch10-10-2 | src: book 10.2 | kind: concept

we may not initially need the entire program in memory. Suppose a program
starts with a list of available options from which the user is to select. Loading
the entire program into memory results in loading the executable code for all
options, regardless of whether or not an option is ultimately selected by the
user.
An alternative strategy is to load pages only as they are needed. This tech-
nique is known as demand paging and is commonly used in virtual memory
systems. With demand-paged virtual memory, pages are loaded only when
they are demanded during program execution. Pages that are never accessed
are thus never loaded into physical memory. A demand-paging system is simi-
lar to a paging system with swapping (Section 9.5.2) where processes reside in
secondary memory (usually an HDD or NVM device). Demand paging explains
one of the primary benefits of virtual memory—by loading only the portions
of programs that are needed, memory is used more efficiently.
Basic Concepts
The general concept behind demand paging, as mentioned, is to load a page in
memory only when it is needed. As a result, while a process is executing, some
pages will be in memory, and some will be in secondary storage. Thus, we need
some form of hardware support to distinguish between the two. The valid–
invalid bit scheme described in Section 9.3.3 can be used for this purpose. This
B
D
D
E
F
H
logical
memory
valid–invalid
bit
frame
page table
i
v
v
i
i
v
i
i
physical memory
backing store
A
A
B
C
C
F
G
H
F
A
C
E
G
Figure 10.4
Page table when some pages are not in main memory.
Virtual Memory
time, however, when the bit is set to “valid,” the associated page is both legal
and in memory. If the bit is set to “invalid,” the page either is not valid (that
is, not in the logical address space of the process) or is valid but is currently in
secondary storage. The page-table entry for a page that is brought into memory
is set as usual, but the page-table entry for a page that is not currently in
memory is simply marked invalid. This situation is depicted in Figure 10.4.
(Notice that marking a page invalid will have no effect if the process never
attempts to access that page.)
But what happens if the process tries to access a page that was not brought
into memory? Access to a page marked invalid causes a page fault. The paging
hardware, in translating the address through the page table, will notice that the
invalid bit is set, causing a trap to the operating system. This trap is the result
of the operating system’s failure to bring the desired page into memory. The
procedure for handling this page fault is straightforward (Figure 10.5):
1. We check an internal table (usually kept with the process control block)
for this process to determine whether the reference was a valid or an
invalid memory access.
2. If the reference was invalid, we terminate the process. If it was valid but
we have not yet brought in that page, we now page it in.
3. We find a free frame (by taking one from the free-frame list, for example).
load M
reference
trap
i
page is on
backing store
operating
system
restart
instruction
reset page
table
page table
physical
memory
bring in
missing page
free frame
backing store
Figure 10.5
Steps in handling a page fault.


## 10.2 Demand Paging
> id: ch10-10-2 | src: book 10.2 | kind: concept

4. We schedule a secondary storage operation to read the desired page into
the newly allocated frame.
5. When the storage read is complete, we modify the internal table kept with
the process and the page table to indicate that the page is now in memory.
6. We restart the instruction that was interrupted by the trap. The process
can now access the page as though it had always been in memory.
In the extreme case, we can start executing a process with no pages in
memory. When the operating system sets the instruction pointer to the first
instruction of the process, which is on a non-memory-resident page, the process
immediately faults for the page. After this page is brought into memory, the
process continues to execute, faulting as necessary until every page that it
needs is in memory. At that point, it can execute with no more faults. This
scheme is pure demand paging: never bring a page into memory until it is
required.
Theoretically, some programs could access several new pages of memory
with each instruction execution (one page for the instruction and many for
data), possibly causing multiple page faults per instruction. This situation
would result in unacceptable system performance. Fortunately, analysis of
running processes shows that this behavior is exceedingly unlikely. Programs
tend to have locality of reference, described in Section 10.6.1, which results in
reasonable performance from demand paging.
The hardware to support demand paging is the same as the hardware for
paging and swapping:
• Page table. This table has the ability to mark an entry invalid through a
valid–invalid bit or a special value of protection bits.
• Secondary memory. This memory holds those pages that are not present
in main memory. The secondary memory is usually a high-speed disk or
NVM device. It is known as the swap device, and the section of storage
used for this purpose is known as swap space. Swap-space allocation is
discussed in Chapter 11.
A crucial requirement for demand paging is the ability to restart any
instruction after a page fault. Because we save the state (registers, condi-
tion code, instruction counter) of the interrupted process when the page fault
occurs, we must be able to restart the process in exactly the same place and
state, except that the desired page is now in memory and is accessible. In most
cases, this requirement is easy to meet. A page fault may occur at any memory
reference. If the page fault occurs on the instruction fetch, we can restart by
fetching the instruction again. If a page fault occurs while we are fetching an
operand, we must fetch and decode the instruction again and then fetch the
operand.
As a worst-case example, consider a three-address instruction such as ADD
the content of A to B, placing the result in C. These are the steps to execute this
instruction:
1. Fetch and decode the instruction (ADD).
2. Fetch A.
Virtual Memory
3. Fetch B.
4. Add A and B.
5. Store the sum in C.
If we fault when we try to store in C (because C is in a page not currently
in memory), we will have to get the desired page, bring it in, correct the
page table, and restart the instruction. The restart will require fetching the
instruction again, decoding it again, fetching the two operands again, and
then adding again. However, there is not much repeated work (less than one
complete instruction), and the repetition is necessary only when a page fault
occurs.
The major difficulty arises when one instruction may modify several dif-
ferent locations. For example, consider the IBM System 360/370 MVC (move
character) instruction, which can move up to 256 bytes from one location to
another (possibly overlapping) location. If either block (source or destination)
straddles a page boundary, a page fault might occur after the move is par-
tially done. In addition, if the source and destination blocks overlap, the source
block may have been modified, in which case we cannot simply restart the
instruction.
This problem can be solved in two different ways. In one solution, the
microcode computes and attempts to access both ends of both blocks. If a page
fault is going to occur, it will happen at this step, before anything is modified.
The move can then take place; we know that no page fault can occur, since all
the relevant pages are in memory. The other solution uses temporary registers
to hold the values of overwritten locations. If there is a page fault, all the old
values are written back into memory before the trap occurs. This action restores
memory to its state before the instruction was started, so that the instruction
can be repeated.
This is by no means the only architectural problem resulting from adding
paging to an existing architecture to allow demand paging, but it illustrates
some of the difficulties involved. Paging is added between the CPU and the
memory in a computer system. It should be entirely transparent to a process.
Thus, people often assume that paging can be added to any system. Although
this assumption is true for a non-demand-paging environment, where a page
fault represents a fatal error, it is not true where a page fault means only that
an additional page must be brought into memory and the process restarted.
Free-Frame List
When a page fault occurs, the operating system must bring the desired page
from secondary storage into main memory. To resolve page faults, most oper-
ating systems maintain a free-frame list, a pool of free frames for satisfying
such requests (Figure 10.6). (Free frames must also be allocated when the stack
or heap segments from a process expand.) Operating systems typically allo-
head
...
Figure 10.6
List of free frames.


## 10.2 Demand Paging
> id: ch10-10-2 | src: book 10.2 | kind: concept

cate free frames using a technique known as zero-fill-on-deman . Zero-fill-
on-demand frames are “zeroed-out” before being allocated, thus erasing their
previous contents. (Consider the potential security implications of not clearing
out the contents of a frame before reassigning it.)
When a system starts up, all available memory is placed on the free-frame
list. As free frames are requested (for example, through demand paging), the
size of the free-frame list shrinks. At some point, the list either falls to zero or
falls below a certain threshold, at which point it must be repopulated. We cover
strategies for both of these situations in Section 10.4.
Performance of Demand Paging
Demand paging can significantly affect the performance of a computer system.
To see why, let’s compute the effective access time for a demand-paged mem-
ory. Assume the memory-access time, denoted ma, is 10 nanoseconds. As long
as we have no page faults, the effective access time is equal to the memory
access time. If, however, a page fault occurs, we must first read the relevant
page from secondary storage and then access the desired word.
Let p be the probability of a page fault (0 ≤p ≤1). We would expect p to
be close to zero—that is, we would expect to have only a few page faults. The
effective access time is then
effective access time = (1 −p) × ma + p × page fault time.
To compute the effective access time, we must know how much time is
needed to service a page fault. A page fault causes the following sequence to
occur:
1. Trap to the operating system.
2. Save the registers and process state.
3. Determine that the interrupt was a page fault.
4. Check that the page reference was legal, and determine the location of the
page in secondary storage.
5. Issue a read from the storage to a free frame:
a. Wait in a queue until the read request is serviced.
b. Wait for the device seek and/or latency time.
c. Begin the transfer of the page to a free frame.
6. While waiting, allocate the CPU core to some other process.
7. Receive an interrupt from the storage I/O subsystem (I/O completed).
8. Save the registers and process state for the other process (if step 6 is
executed).
9. Determine that the interrupt was from the secondary storage device.
10. Correct the page table and other tables to show that the desired page is
now in memory.
11. Wait for the CPU core to be allocated to this process again.
Virtual Memory
12. Restore the registers, process state, and new page table, and then resume
the interrupted instruction.
Not all of these steps are necessary in every case. For example, we are assuming
that, in step 6, the CPU is allocated to another process while the I/O occurs.
This arrangement allows multiprogramming to maintain CPU utilization but
requires additional time to resume the page-fault service routine when the I/O
transfer is complete.
In any case, there are three major task components of the page-fault service
time:
1. Service the page-fault interrupt.
2. Read in the page.
3. Restart the process.
The first and third tasks can be reduced, with careful coding, to several
hundred instructions. These tasks may take from 1 to 100 microseconds each.
Let’s consider the case of HDDs being used as the paging device. The page-
switch time will probably be close to 8 milliseconds. (A typical hard disk has
an average latency of 3 milliseconds, a seek of 5 milliseconds, and a transfer
time of 0.05 milliseconds. Thus, the total paging time is about 8 milliseconds,
including hardware and software time.) Remember also that we are looking at
only the device-service time. If a queue of processes is waiting for the device,
we have to add queuing time as we wait for the paging device to be free to
service our request, increasing even more the time to page in.
With an average page-fault service time of 8 milliseconds and a memory-
access time of 200 nanoseconds, the effective access time in nanoseconds is
effective access time = (1 −p) × (200) + p (8 milliseconds)
= (1 −p) × 200 + p × 8,000,000
= 200 + 7,999,800 × p.
We see, then, that the effective access time is directly proportional to the
page-fault rate. If one access out of 1,000 causes a page fault, the effective access
time is 8.2 microseconds. The computer will be slowed down by a factor of 40
because of demand paging! If we want performance degradation to be less than
10 percent, we need to keep the probability of page faults at the following level:
220 > 200 + 7,999,800 × p,
20 > 7,999,800 × p,
p < 0.0000025.
That is, to keep the slowdown due to paging at a reasonable level, we can allow
fewer that one memory access out of 399,990 to page-fault. In sum, it is impor-
tant to keep the page-fault rate low in a demand-paging system. Otherwise,
the effective access time increases, slowing process execution dramatically.
An additional aspect of demand paging is the handling and overall use of
swap space. I/O to swap space is generally faster than that to the file system. It
is faster because swap space is allocated in much larger blocks, and file lookups
and indirect allocation methods are not used (Chapter 11). One option for the


## 10.3 Copy-on-Write
> id: ch10-10-3 | src: book 10.3; slides 25-28 | kind: concept

system to gain better paging throughput is by copying an entire file image into
the swap space at process startup and then performing demand paging from
the swap space. The obvious disadvantage of this approach is the copying of
the file image at program start-up. A second option—and one practiced by
several operating systems, including Linux and Windows—is to demand-page
from the file system initially but to write the pages to swap space as they are
replaced. This approach will ensure that only needed pages are read from the
file system but that all subsequent paging is done from swap space.
Some systems attempt to limit the amount of swap space used through
demand paging of binary executable files. Demand pages for such files are
brought directly from the file system. However, when page replacement is
called for, these frames can simply be overwritten (because they are never
modified), and the pages can be read in from the file system again if needed.
Using this approach, the file system itself serves as the backing store. However,
swap space must still be used for pages not associated with a file (known as
anonymous memory); these pages include the stack and heap for a process.
This method appears to be a good compromise and is used in several systems,
including Linux and BSD UNIX.
As described in Section 9.5.3, mobile operating systems typically do not
support swapping. Instead, these systems demand-page from the file sys-
tem and reclaim read-only pages (such as code) from applications if memory
becomes constrained. Such data can be demand-paged from the file system if
it is later needed. Under iOS, anonymous memory pages are never reclaimed
from an application unless the application is terminated or explicitly releases
the memory. In Section 10.7, we cover compressed memory, a commonly used
alternative to swapping in mobile systems.


- Copy-on-Write (COW) allows both parent and child processes to initially share the same pages in memory
  - If either process modifies a shared page, only then is the page copied
- COW allows more efficient process creation as only modified pages are copied
- In general, free pages are allocated from a pool of zero-fill-on-demand pages
  - Pool should always have free frames for fast demand page execution
    - Don’t want to have to free a frame as well as other processing on page fault
  - Why zero-out a page before allocating it?
- vfork() variation on fork() system call has parent suspend and child using copy-on-write address space of parent
  - Designed to have child call exec()
  - Very efficient


**Before Process 1 Modifies Page C**



> **[ASSET ch10_ill_011]** Figure from slide 26
> - type: illustration
> - kind: other
> - file: assets/ch10_slide26_img010.jpg
> - src: slides 26
> - shows: Illustration from slide 26
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**After Process 1 Modifies Page C**



> **[ASSET ch10_ill_012]** Figure from slide 27
> - type: illustration
> - kind: other
> - file: assets/ch10_slide27_img011.jpg
> - src: slides 27
> - shows: Illustration from slide 27
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**What Happens if There is no Free Frame?**

- Used up by process pages
- Also in demand from the kernel, I/O buffers, etc
- How much to allocate to each?
- Page replacement – find some page in memory, but not really in use, page it out
  - Algorithm – terminate? swap out? replace the page?
  - Performance – want an algorithm which will result in minimum number of page faults
- Same page may be brought into memory several times


## 10.3 Copy-on-Write
> id: ch10-10-3 | src: book 10.3 | kind: concept

In Section 10.2, we illustrated how a process can start quickly by demand-
paging in the page containing the first instruction. However, process creation
using the fork() system call may initially bypass the need for demand paging
by using a technique similar to page sharing (covered in Section 9.3.4). This
technique provides rapid process creation and minimizes the number of new
pages that must be allocated to the newly created process.
Recall that the fork() system call creates a child process that is a duplicate
of its parent. Traditionally, fork() worked by creating a copy of the parent’s
address space for the child, duplicating the pages belonging to the parent.
However, considering that many child processes invoke the exec() system call
immediately after creation, the copying of the parent’s address space may be
unnecessary. Instead, we can use a technique known as copy-on-write, which
works by allowing the parent and child processes initially to share the same
pages. These shared pages are marked as copy-on-write pages, meaning that
if either process writes to a shared page, a copy of the shared page is created.
Copy-on-write is illustrated in Figures 10.7 and 10.8, which show the contents
of the physical memory before and after process 1 modifies page C.
For example, assume that the child process attempts to modify a page
containing portions of the stack, with the pages set to be copy-on-write. The
operating system will obtain a frame from the free-frame list and create a copy
Virtual Memory
process1
physical
memory
page A
page B
page C
process2
Figure 10.7
Before process 1 modifies page C.
of this page, mapping it to the address space of the child process. The child
process will then modify its copied page and not the page belonging to the
parent process. Obviously, when the copy-on-write technique is used, only the
pages that are modified by either process are copied; all unmodified pages
can be shared by the parent and child processes. Note, too, that only pages
that can be modified need be marked as copy-on-write. Pages that cannot
be modified (pages containing executable code) can be shared by the parent
and child. Copy-on-write is a common technique used by several operating
systems, including Windows, Linux, and macOS.
Several versions of UNIX (including Linux, macOS, and BSD UNIX) provide
a variation of the fork() system call—vfork() (for virtual memory fork)—
that operates differently from fork() with copy-on-write. With vfork(), the
parent process is suspended, and the child process uses the address space of
the parent. Because vfork() does not use copy-on-write, if the child process
changes any pages of the parent’s address space, the altered pages will be
visible to the parent once it resumes. Therefore, vfork() must be used with
caution to ensure that the child process does not modify the address space of
the parent. vfork() is intended to be used when the child process calls exec()
immediately after creation. Because no copying of pages takes place, vfork()
process 1
physical
memory
page A
page B
page C
copy of page C
process 2
Figure 10.8
After process 1 modifies page C.


## 10.4 Page Replacement
> id: ch10-10-4 | src: book 10.4; slides 29-84 | kind: concept

is an extremely efficient method of process creation and is sometimes used to
implement UNIX command-line shell interfaces.


- Prevent over-allocation of memory by modifying page-fault service routine to include page replacement
- Use modify (dirty) bit to reduce overhead of page transfers – only modified pages are written to disk
- Page replacement completes separation between logical memory and physical memory – large virtual memory can be provided on a smaller physical memory


**Need For Page Replacement**



> **[ASSET ch10_ill_013]** Figure from slide 30
> - type: illustration
> - kind: other
> - file: assets/ch10_slide30_img012.jpg
> - src: slides 30
> - shows: Illustration from slide 30
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Basic Page Replacement**

- Find the location of the desired page on disk
- Find a free frame:   -  If there is a free frame, use it   -  If there is no free frame, use a page replacement algorithm to select a victim frame   -  Write victim frame to disk if dirty
- Bring  the desired page into the (newly) free frame; update the page and frame tables
- Continue the process by restarting the instruction that caused the trap
- Note now potentially 2 page transfers for page fault – increasing EAT




> **[ASSET ch10_ill_014]** Figure from slide 32
> - type: illustration
> - kind: other
> - file: assets/ch10_slide32_img013.jpg
> - src: slides 32
> - shows: Illustration from slide 32
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Page and Frame Replacement Algorithms**

- Frame-allocation algorithm determines
  - How many frames to give each process
  - Which frames to replace
- Page-replacement algorithm
  - Want lowest page-fault rate on both first access and re-access
- Evaluate algorithm by running it on a particular string of memory references (reference string) and computing the number of page faults on that string
  - String is just page numbers, not full addresses
  - Repeated access to the same page does not cause a page fault
  - Results depend on number of frames available
- In all our examples, the reference string of referenced page numbers is
- 7,0,1,2,0,3,0,4,2,3,0,3,0,3,2,1,2,0,1,7,0,1


**Graph of Page Faults Versus the Number of Frames**



> **[ASSET ch10_ill_015]** Figure from slide 34
> - type: illustration
> - kind: other
> - file: assets/ch10_slide34_img014.png
> - src: slides 34
> - shows: Illustration from slide 34
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**First-In-First-Out (FIFO) Algorithm**

- Reference string: 7,0,1,2,0,3,0,4,2,3,0,3,0,3,2,1,2,0,1,7,0,1
- 3 frames (3 pages can be in memory at a time per process)
- Can vary by reference string: consider 1,2,3,4,1,2,5,1,2,3,4,5
  - Adding more frames can cause more page faults!
    - Belady’s Anomaly
- How to track ages of pages?
  - Just use a FIFO queue
- 15 page faults


> **[ASSET ch10_ill_016]** Figure from slide 35
> - type: illustration
> - kind: other
> - file: assets/ch10_slide35_img015.png
> - src: slides 35
> - shows: Illustration from slide 35
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**FIFO Illustrating Belady’s Anomaly**



> **[ASSET ch10_ill_017]** Figure from slide 36
> - type: illustration
> - kind: other
> - file: assets/ch10_slide36_img016.png
> - src: slides 36
> - shows: Illustration from slide 36
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Optimal Algorithm**

- Replace page that will not be used for longest period of time
  - 9 is optimal for the example
- How do you know this?
  - Can’t read the future
- Used for measuring how well your algorithm performs


> **[ASSET ch10_ill_018]** Figure from slide 37
> - type: illustration
> - kind: other
> - file: assets/ch10_slide37_img017.png
> - src: slides 37
> - shows: Illustration from slide 37
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Least Recently Used (LRU) Algorithm**

- Use past knowledge rather than future
- Replace page that has not been used in the most amount of time
- Associate time of last use with each page
- 12 faults – better than FIFO but worse than OPT
- Generally good algorithm and frequently used
- But how to implement?


> **[ASSET ch10_ill_019]** Figure from slide 38
> - type: illustration
> - kind: other
> - file: assets/ch10_slide38_img018.jpg
> - src: slides 38
> - shows: Illustration from slide 38
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**LRU Algorithm (Cont.)**

- Counter implementation
  - Every page entry has a counter; every time page is referenced through this entry, copy the clock into the counter
  - When a page needs to be changed, look at the counters to find smallest value
    - Search through table needed
- Stack implementation
  - Keep a stack of page numbers in a double link form:
  - Page referenced:
    - move it to the top
    - requires 6 pointers to be changed
  - But each update more expensive
  - No search for replacement


**LRU Algorithm (Cont.)**

- LRU and OPT are cases of stack algorithms that don’t have Belady’s Anomaly
- Use Of A Stack to Record Most Recent Page References


> **[ASSET ch10_ill_020]** Figure from slide 40
> - type: illustration
> - kind: other
> - file: assets/ch10_slide40_img019.png
> - src: slides 40
> - shows: Illustration from slide 40
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**LRU Approximation Algorithms**

- LRU needs special hardware and still slow
- Reference bit
  - With each page associate a bit, initially = 0
  - When page is referenced bit set to 1
  - Replace any with reference bit = 0 (if one exists)
    - We do not know the order, however


**LRU Approximation Algorithms (cont.)**

- Second-chance algorithm
  - Generally FIFO, plus hardware-provided reference bit
  - Clock replacement
  - If page to be replaced has
    - Reference bit = 0 -> replace it
    - reference bit = 1 then:
      - set reference bit 0, leave page in memory
      - replace next page, subject to same rules


**Second-chance Algorithm**



> **[ASSET ch10_ill_021]** Figure from slide 43
> - type: illustration
> - kind: other
> - file: assets/ch10_slide43_img020.png
> - src: slides 43
> - shows: Illustration from slide 43
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Enhanced Second-Chance Algorithm**

- Improve algorithm by using reference bit and modify bit (if available) in concert
- Take ordered pair (reference, modify):
  - (0, 0) neither recently used not modified – best page to replace
  - (0, 1) not recently used but modified – not quite as good, must write out before replacement
  - (1, 0) recently used but clean – probably will be used again soon
  - (1, 1) recently used and modified – probably will be used again soon and need to write out before replacement
- When page replacement called for, use the clock scheme  but use the four classes replace page in lowest non-empty class
  - Might need to search circular queue several times


**Counting Algorithms**

- Keep a counter of the number of references that have been made to each page
  - Not common
- Lease Frequently Used (LFU) Algorithm:
  - Replaces page with smallest count
- Most Frequently Used (MFU) Algorithm:
  - Based on the argument that the page with the smallest count was probably just brought in and has yet to be used


**Page-Buffering Algorithms**

- Keep a pool of free frames, always
  - Then frame available when needed, not found at fault time
  - Read page into free frame and select victim to evict and add to free pool
  - When convenient, evict victim
- Possibly, keep list of modified pages
  - When backing store otherwise idle, write pages there and set to non-dirty
- Possibly, keep free frame contents intact and note what is in them
  - If referenced again before reused, no need to load contents again from disk
  - Generally useful to reduce penalty if wrong victim frame selected


**Applications and Page Replacement**

- All of these algorithms have OS guessing about future page access
- Some applications have better knowledge – i.e. databases
- Memory intensive applications can cause double buffering
  - OS keeps copy of page in memory as I/O buffer
  - Application keeps page in memory for its own work
- Operating system can given direct access to the disk, getting out of the way of the applications
  - Raw disk mode
- Bypasses buffering, locking, etc.


**Need For Page Replacement**



> **[ASSET ch10_ill_022]** Figure from slide 83
> - type: illustration
> - kind: other
> - file: assets/ch10_slide83_img032.jpg
> - src: slides 83
> - shows: Illustration from slide 83
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Priority Allocation**

- Use a proportional allocation scheme using priorities rather than size
- If process Pi generates a page fault,
  - select for replacement one of its frames
  - select for replacement a frame from a process with lower priority number


## 10.4 Page Replacement
> id: ch10-10-4 | src: book 10.4 | kind: concept

In our earlier discussion of the page-fault rate, we assumed that each page
faults at most once, when it is first referenced. This representation is not strictly
accurate, however. If a process of ten pages actually uses only half of them, then
demand paging saves the I/O necessary to load the five pages that are never
used. We could also increase our degree of multiprogramming by running
twice as many processes. Thus, if we had forty frames, we could run eight
processes, rather than the four that could run if each required ten frames (five
of which were never used).
If we increase our degree of multiprogramming, we are over-allocating
memory. If we run six processes, each of which is ten pages in size but actually
uses only five pages, we have higher CPU utilization and throughput, with
ten frames to spare. It is possible, however, that each of these processes, for
a particular data set, may suddenly try to use all ten of its pages, resulting in a
need for sixty frames when only forty are available.
Further, consider that system memory is not used only for holding program
pages. Buffers for I/O also consume a considerable amount of memory. This use
can increase the strain on memory-placement algorithms. Deciding how much
memory to allocate to I/O and how much to program pages is a significant
challenge. Some systems allocate a fixed percentage of memory for I/O buffers,
whereas others allow both processes and the I/O subsystem to compete for all
system memory. Section 14.6 discusses the integrated relationship between I/O
buffers and virtual memory techniques.
Over-allocation of memory manifests itself as follows. While a process is
executing, a page fault occurs. The operating system determines where the
desired page is residing on secondary storage but then finds that there are
no free frames on the free-frame list; all memory is in use. This situation is
illustrated in Figure 10.9, where the fact that there are no free frames is depicted
by a question mark.
The operating system has several options at this point. It could terminate
the process. However, demand paging is the operating system’s attempt to
improve the computer system’s utilization and throughput. Users should not
be aware that their processes are running on a paged system—paging should
be logically transparent to the user. So this option is not the best choice.
The operating system could instead use standard swapping and swap
out a process, freeing all its frames and reducing the level of multiprogram-
ming. However, as discussed in Section 9.5, standard swapping is no longer
used by most operating systems due to the overhead of copying entire pro-
cesses between memory and swap space. Most operating systems now com-
bine swapping pages with page replacement, a technique we describe in detail
in the remainder of this section.
Basic Page Replacement
Page replacement takes the following approach. If no frame is free, we find one
that is not currently being used and free it. We can free a frame by writing its
Virtual Memory
Figure 10.9
Need for page replacement.
contents to swap space and changing the page table (and all other tables) to
indicate that the page is no longer in memory (Figure 10.10). We can now use
the freed frame to hold the page for which the process faulted. We modify the
page-fault service routine to include page replacement:
1. Find the location of the desired page on secondary storage.
2. Find a free frame:
a. If there is a free frame, use it.
b. If there is no free frame, use a page-replacement algorithm to select
a victim frame.
c. Write the victim frame to secondary storage (if necessary); change
the page and frame tables accordingly.
3. Read the desired page into the newly freed frame; change the page and
frame tables.
4. Continue the process from where the page fault occurred.
Notice that, if no frames are free, two page transfers (one for the page-out
and one for the page-in) are required. This situation effectively doubles the
page-fault service time and increases the effective access time accordingly.
We can reduce this overhead by using a modify bit (or dirty bit). When this
scheme is used, each page or frame has a modify bit associated with it in the
hardware. The modify bit for a page is set by the hardware whenever any byte
in the page is written into, indicating that the page has been modified. When
we select a page for replacement, we examine its modify bit. If the bit is set,


## 10.4 Page Replacement
> id: ch10-10-4 | src: book 10.4 | kind: concept

valid–invalid bit
frame
f
page table
victim
backing store
change
to invalid
page out
victim
page
page in
desired
page
reset page
table for
new page
physical
memory
f
i
v
Figure 10.10
Page replacement.
we know that the page has been modified since it was read in from secondary
storage. In this case, we must write the page to storage. If the modify bit is not
set, however, the page has not been modified since it was read into memory. In
this case, we need not write the memory page to storage: it is already there. This
technique also applies to read-only pages (for example, pages of binary code).
Such pages cannot be modified; thus, they may be discarded when desired.
This scheme can significantly reduce the time required to service a page fault,
since it reduces I/O time by one-half if the page has not been modified.
Page replacement is basic to demand paging. It completes the separation
between logical memory and physical memory. With this mechanism, an enor-
mous virtual memory can be provided for programmers on a smaller physical
memory. With no demand paging, logical addresses are mapped into physical
addresses, and the two sets of addresses can be different. All the pages of a
process still must be in physical memory, however. With demand paging, the
size of the logical address space is no longer constrained by physical memory.
If we have a process of twenty pages, we can execute it in ten frames simply by
using demand paging and using a replacement algorithm to find a free frame
whenever necessary. If a page that has been modified is to be replaced, its
contents are copied to secondary storage. A later reference to that page will
cause a page fault. At that time, the page will be brought back into memory,
perhaps replacing some other page in the process.
We must solve two major problems to implement demand paging: we must
develop a frame-allocation algorithm and a page-replacement algorithm.
That is, if we have multiple processes in memory, we must decide how many
frames to allocate to each process; and when page replacement is required,
we must select the frames that are to be replaced. Designing appropriate algo-
rithms to solve these problems is an important task, because secondary storage
Virtual Memory
I/O is so expensive. Even slight improvements in demand-paging methods
yield large gains in system performance.
There are many different page-replacement algorithms. Every operating
system probably has its own replacement scheme. How do we select a par-
ticular replacement algorithm? In general, we want the one with the lowest
page-fault rate.
We evaluate an algorithm by running it on a particular string of memory
references and computing the number of page faults. The string of memory
references is called a reference string. We can generate reference strings arti-
ficially (by using a random-number generator, for example), or we can trace
a given system and record the address of each memory reference. The latter
choice produces a large number of data (on the order of 1 million addresses
per second). To reduce the number of data, we use two facts.
First, for a given page size (and the page size is generally fixed by the hard-
ware or system), we need to consider only the page number, rather than the
entire address. Second, if we have a reference to a page p, then any references
to page p that immediately follow will never cause a page fault. Page p will
be in memory after the first reference, so the immediately following references
will not fault.
For example, if we trace a particular process, we might record the following
address sequence:
0100, 0432, 0101, 0612, 0102, 0103, 0104, 0101, 0611, 0102, 0103,
0104, 0101, 0610, 0102, 0103, 0104, 0101, 0609, 0102, 0105
At 100 bytes per page, this sequence is reduced to the following reference
string:
1, 4, 1, 6, 1, 6, 1, 6, 1, 6, 1
To determine the number of page faults for a particular reference string and
page-replacement algorithm, we also need to know the number of page frames
available. Obviously, as the number of frames available increases, the number
of page faults decreases. For the reference string considered previously, for
example, if we had three or more frames, we would have only three faults—
one fault for the first reference to each page. In contrast, with only one frame
available, we would have a replacement with every reference, resulting in
eleven faults. In general, we expect a curve such as that in Figure 10.11. As the
number of frames increases, the number of page faults drops to some minimal
level. Of course, adding physical memory increases the number of frames.
We next illustrate several page-replacement algorithms. In doing so, we
use the reference string
7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1
for a memory with three frames.
FIFO Page Replacement
The simplest page-replacement algorithm is a first-in, first-out (FIFO) algo-
rithm. A FIFO replacement algorithm associates with each page the time when
that page was brought into memory. When a page must be replaced, the oldest
page is chosen. Notice that it is not strictly necessary to record the time when a


## 10.4 Page Replacement
> id: ch10-10-4 | src: book 10.4 | kind: concept

number of page faults
number of frames
Figure 10.11
Graph of page faults versus number of frames.
page is brought in. We can create a FIFO queue to hold all pages in memory. We
replace the page at the head of the queue. When a page is brought into memory,
we insert it at the tail of the queue.
For our example reference string, our three frames are initially empty. The
first three references (7, 0, 1) cause page faults and are brought into these empty
frames. The next reference (2) replaces page 7, because page 7 was brought in
first. Since 0 is the next reference and 0 is already in memory, we have no fault
for this reference. The first reference to 3 results in replacement of page 0, since
it is now first in line. Because of this replacement, the next reference, to 0, will
fault. Page 1 is then replaced by page 0. This process continues as shown in
Figure 10.12. Every time a fault occurs, we show which pages are in our three
frames. There are fifteen faults altogether.
The FIFO page-replacement algorithm is easy to understand and program.
However, its performance is not always good. On the one hand, the page
replaced may be an initialization module that was used a long time ago and is
no longer needed. On the other hand, it could contain a heavily used variable
that was initialized early and is in constant use.
Notice that, even if we select for replacement a page that is in active use,
everything still works correctly. After we replace an active page with a new
page frames
reference string
Figure 10.12
FIFO page-replacement algorithm.
Virtual Memory
number of page faults
number of frames
Figure 10.13
Page-fault curve for FIFO replacement on a reference string.
one, a fault occurs almost immediately to retrieve the active page. Some other
page must be replaced to bring the active page back into memory. Thus, a bad
replacement choice increases the page-fault rate and slows process execution.
It does not, however, cause incorrect execution.
To illustrate the problems that are possible with a FIFO page-replacement
algorithm, consider the following reference string:
1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5
Figure 10.13 shows the curve of page faults for this reference string versus the
number of available frames. Notice that the number of faults for four frames
(ten) is greater than the number of faults for three frames (nine)! This most
unexpected result is known as Belady’s anomaly: for some page-replacement
algorithms, the page-fault rate may increase as the number of allocated frames
increases. We would expect that giving more memory to a process would
improve its performance. In some early research, investigators noticed that this
assumption was not always true. Belady’s anomaly was discovered as a result.
Optimal Page Replacement
One result of the discovery of Belady’s anomaly was the search for an optimal
page-replacement algorithm—the algorithm that has the lowest page-fault
rate of all algorithms and will never suffer from Belady’s anomaly. Such an
algorithm does exist and has been called OPT or MIN. It is simply this:
Replace the page that will not be used for the longest period of time.
Use of this page-replacement algorithm guarantees the lowest possible page-
fault rate for a fixed number of frames.
For example, on our sample reference string, the optimal page-replacement
algorithm would yield nine page faults, as shown in Figure 10.14. The first three
references cause faults that fill the three empty frames. The reference to page
2 replaces page 7, because page 7 will not be used until reference 18, whereas


## 10.4 Page Replacement
> id: ch10-10-4 | src: book 10.4 | kind: concept

page frames
reference string
Figure 10.14
Optimal page-replacement algorithm.
page 0 will be used at 5, and page 1 at 14. The reference to page 3 replaces
page 1, as page 1 will be the last of the three pages in memory to be referenced
again. With only nine page faults, optimal replacement is much better than
a FIFO algorithm, which results in fifteen faults. (If we ignore the first three,
which all algorithms must suffer, then optimal replacement is twice as good as
FIFO replacement.) In fact, no replacement algorithm can process this reference
string in three frames with fewer than nine faults.
Unfortunately, the optimal page-replacement algorithm is difficult to
implement, because it requires future knowledge of the reference string.
(We encountered a similar situation with the SJF CPU-scheduling algorithm in
Section 5.3.2.) As a result, the optimal algorithm is used mainly for comparison
studies. For instance, it may be useful to know that, although a new algorithm
is not optimal, it is within 12.3 percent of optimal at worst and within 4.7
percent on average.
LRU Page Replacement
If the optimal algorithm is not feasible, perhaps an approximation of the opti-
mal algorithm is possible. The key distinction between the FIFO and OPT algo-
rithms (other than looking backward versus forward in time) is that the FIFO
algorithm uses the time when a page was brought into memory, whereas the
OPT algorithm uses the time when a page is to be used. If we use the recent past
as an approximation of the near future, then we can replace the page that has
not been used for the longest period of time. This approach is the least recently
used (LRU) algorithm.
LRU replacement associates with each page the time of that page’s last use.
When a page must be replaced, LRU chooses the page that has not been used
for the longest period of time. We can think of this strategy as the optimal
page-replacement algorithm looking backward in time, rather than forward.
(Strangely, if we let SR be the reverse of a reference string S, then the page-fault
rate for the OPT algorithm on S is the same as the page-fault rate for the OPT
algorithm on SR. Similarly, the page-fault rate for the LRU algorithm on S is the
same as the page-fault rate for the LRU algorithm on SR.)
The result of applying LRU replacement to our example reference string is
shown in Figure 10.15. The LRU algorithm produces twelve faults. Notice that
the first five faults are the same as those for optimal replacement. When the
reference to page 4 occurs, however, LRU replacement sees that, of the three
frames in memory, page 2 was used least recently. Thus, the LRU algorithm
replaces page 2, not knowing that page 2 is about to be used. When it then faults
Virtual Memory
page frames
reference string
Figure 10.15
LRU page-replacement algorithm.
for page 2, the LRU algorithm replaces page 3, since it is now the least recently
used of the three pages in memory. Despite these problems, LRU replacement
with twelve faults is much better than FIFO replacement with fifteen.
The LRU policy is often used as a page-replacement algorithm and is con-
sidered to be good. The major problem is how to implement LRU replacement.
An LRU page-replacement algorithm may require substantial hardware assis-
tance. The problem is to determine an order for the frames defined by the time
of last use. Two implementations are feasible:
• Counters. In the simplest case, we associate with each page-table entry a
time-of-use field and add to the CPU a logical clock or counter. The clock is
incremented for every memory reference. Whenever a reference to a page
is made, the contents of the clock register are copied to the time-of-use
field in the page-table entry for that page. In this way, we always have
the “time” of the last reference to each page. We replace the page with the
smallest time value. This scheme requires a search of the page table to find
the LRU page and a write to memory (to the time-of-use field in the page
table) for each memory access. The times must also be maintained when
page tables are changed (due to CPU scheduling). Overflow of the clock
must be considered.
• Stack. Another approach to implementing LRU replacement is to keep a
stack of page numbers. Whenever a page is referenced, it is removed from
the stack and put on the top. In this way, the most recently used page is
always at the top of the stack, and the least recently used page is always
at the bottom (Figure 10.16). Because entries must be removed from the
middle of the stack, it is best to implement this approach by using a doubly
linked list with a head pointer and a tail pointer. Removing a page and
putting it on the top of the stack then requires changing six pointers at
worst. Each update is a little more expensive, but there is no search for
a replacement; the tail pointer points to the bottom of the stack, which is
the LRU page. This approach is particularly appropriate for software or
microcode implementations of LRU replacement.
Like optimal replacement, LRU replacement does not suffer from Belady’s
anomaly. Both belong to a class of page-replacement algorithms, called stack
algorithms, that can never exhibit Belady’s anomaly. A stack algorithm is an
algorithm for which it can be shown that the set of pages in memory for n
frames is always a subset of the set of pages that would be in memory with n


## 10.4 Page Replacement
> id: ch10-10-4 | src: book 10.4 | kind: concept

stack
before
a
stack
after
b
reference string
a
b
Figure 10.16
Use of a stack to record the most recent page references.
+ 1 frames. For LRU replacement, the set of pages in memory would be the n
most recently referenced pages. If the number of frames is increased, these n
pages will still be the most recently referenced and so will still be in memory.
Note that neither implementation of LRU would be conceivable without
hardware assistance beyond the standard TLB registers. The updating of the
clock fields or stack must be done for every memory reference. If we were
to use an interrupt for every reference to allow software to update such data
structures, it would slow every memory reference by a factor of at least ten,
hence slowing every process by a factor of ten. Few systems could tolerate that
level of overhead for memory management.
LRU-Approximation Page Replacement
Not many computer systems provide sufficient hardware support for true LRU
page replacement. In fact, some systems provide no hardware support, and
other page-replacement algorithms (such as a FIFO algorithm) must be used.
Many systems provide some help, however, in the form of a reference bit. The
reference bit for a page is set by the hardware whenever that page is referenced
(either a read or a write to any byte in the page). Reference bits are associated
with each entry in the page table.
Initially, all bits are cleared (to 0) by the operating system. As a process
executes, the bit associated with each page referenced is set (to 1) by the
hardware. After some time, we can determine which pages have been used and
which have not been used by examining the reference bits, although we do not
know the order of use. This information is the basis for many page-replacement
algorithms that approximate LRU replacement.
Additional-Reference-Bits Algorithm
We can gain additional ordering information by recording the reference bits at
regular intervals. We can keep an 8-bit byte for each page in a table in memory.
At regular intervals (say, every 100 milliseconds), a timer interrupt transfers
control to the operating system. The operating system shifts the reference bit
for each page into the high-order bit of its 8-bit byte, shifting the other bits right
Virtual Memory
by 1 bit and discarding the low-order bit. These 8-bit shift registers contain the
history of page use for the last eight time periods. If the shift register contains
00000000, for example, then the page has not been used for eight time periods.
A page that is used at least once in each period has a shift register value of
11111111. A page with a history register value of 11000100 has been used more
recently than one with a value of 01110111. If we interpret these 8-bit bytes as
unsigned integers, the page with the lowest number is the LRU page, and it can
be replaced. Notice that the numbers are not guaranteed to be unique, however.
We can either replace (swap out) all pages with the smallest value or use the
FIFO method to choose among them.
The number of bits of history included in the shift register can be varied,
of course, and is selected (depending on the hardware available) to make the
updating as fast as possible. In the extreme case, the number can be reduced to
zero, leaving only the reference bit itself. This algorithm is called the second-
chance page-replacement algorithm.
Second-Chance Algorithm
The basic algorithm of second-chance replacement is a FIFO replacement algo-
rithm. When a page has been selected, however, we inspect its reference bit. If
the value is 0, we proceed to replace this page; but if the reference bit is set to
1, we give the page a second chance and move on to select the next FIFO page.
When a page gets a second chance, its reference bit is cleared, and its arrival
time is reset to the current time. Thus, a page that is given a second chance
will not be replaced until all other pages have been replaced (or given second
chances). In addition, if a page is used often enough to keep its reference bit
set, it will never be replaced.
One way to implement the second-chance algorithm (sometimes referred
to as the clock algorithm) is as a circular queue. A pointer (that is, a hand on
the clock) indicates which page is to be replaced next. When a frame is needed,
the pointer advances until it finds a page with a 0 reference bit. As it advances,
it clears the reference bits (Figure 10.17). Once a victim page is found, the page
is replaced, and the new page is inserted in the circular queue in that position.
Notice that, in the worst case, when all bits are set, the pointer cycles through
the whole queue, giving each page a second chance. It clears all the reference
bits before selecting the next page for replacement. Second-chance replacement
degenerates to FIFO replacement if all bits are set.
Enhanced Second-Chance Algorithm
We can enhance the second-chance algorithm by considering the reference bit
and the modify bit (described in Section 10.4.1) as an ordered pair. With these
two bits, we have the following four possible classes:
1. (0, 0) neither recently used nor modified—best page to replace
2. (0, 1) not recently used but modified—not quite as good, because the page
will need to be written out before replacement
3. (1, 0) recently used but clean—probably will be used again soon


## 10.4 Page Replacement
> id: ch10-10-4 | src: book 10.4 | kind: concept

circular queue of pages
(a)
next
victim
reference
bits
pages
…
…
circular queue of pages
(b)
reference
bits
pages
…
…
Figure 10.17
Second-chance (clock) page-replacement algorithm.
4. (1, 1) recently used and modified—probably will be used again soon, and
the page will be need to be written out to secondary storage before it can
be replaced
Each page is in one of these four classes. When page replacement is called
for, we use the same scheme as in the clock algorithm; but instead of examining
whether the page to which we are pointing has the reference bit set to 1,
we examine the class to which that page belongs. We replace the first page
encountered in the lowest nonempty class. Notice that we may have to scan the
circular queue several times before we find a page to be replaced. The major
difference between this algorithm and the simpler clock algorithm is that here
we give preference to those pages that have been modified in order to reduce
the number of I/Os required.
Counting-Based Page Replacement
There are many other algorithms that can be used for page replacement. For
example, we can keep a counter of the number of references that have been
made to each page and develop the following two schemes.
• The least frequently used (LFU) page-replacement algorithm requires that
the page with the smallest count be replaced. The reason for this selection is
that an actively used page should have a large reference count. A problem
arises, however, when a page is used heavily during the initial phase of
Virtual Memory
a process but then is never used again. Since it was used heavily, it has
a large count and remains in memory even though it is no longer needed.
One solution is to shift the counts right by 1 bit at regular intervals, forming
an exponentially decaying average usage count.
• The most frequently used (MFU) page-replacement algorithm is based
on the argument that the page with the smallest count was probably just
brought in and has yet to be used.
As you might expect, neither MFU nor LFU replacement is common. The imple-
mentation of these algorithms is expensive, and they do not approximate OPT
replacement well.
Page-Buffering Algorithms
Other procedures are often used in addition to a specific page-replacement
algorithm. For example, systems commonly keep a pool of free frames. When
a page fault occurs, a victim frame is chosen as before. However, the desired
page is read into a free frame from the pool before the victim is written out. This
procedure allows the process to restart as soon as possible, without waiting for
the victim page to be written out. When the victim is later written out, its frame
is added to the free-frame pool.
An expansion of this idea is to maintain a list of modified pages. Whenever
the paging device is idle, a modified page is selected and is written to secondary
storage. Its modify bit is then reset. This scheme increases the probability that
a page will be clean when it is selected for replacement and will not need to be
written out.
Another modification is to keep a pool of free frames but to remember
which page was in each frame. Since the frame contents are not modified when
a frame is written to secondary storage, the old page can be reused directly from
the free-frame pool if it is needed before that frame is reused. No I/O is needed
in this case. When a page fault occurs, we first check whether the desired page
is in the free-frame pool. If it is not, we must select a free frame and read into
it.
Some versions of the UNIX system use this method in conjunction with
the second-chance algorithm. It can be a useful augmentation to any page-
replacement algorithm, to reduce the penalty incurred if the wrong victim page
is selected. We describe these—and other—modifications in Section 10.5.3.
Applications and Page Replacement
In certain cases, applications accessing data through the operating system’s vir-
tual memory perform worse than if the operating system provided no buffer-
ing at all. A typical example is a database, which provides its own memory
management and I/O buffering. Applications like this understand their mem-
ory use and storage use better than does an operating system that is implement-
ing algorithms for general-purpose use. Furthermore, if the operating system
is buffering I/O and the application is doing so as well, then twice the memory
is being used for a set of I/O.
In another example, data warehouses frequently perform massive sequen-
tial storage reads, followed by computations and writes. The LRU algorithm


## 10.5 Allocation of Frames
> id: ch10-10-5 | src: book 10.5; slides 48-54 | kind: concept

would be removing old pages and preserving new ones, while the applica-
tion would more likely be reading older pages than newer ones (as it starts its
sequential reads again). Here, MFU would actually be more efficient than LRU.
Because of such problems, some operating systems give special programs
the ability to use a secondary storage partition as a large sequential array of
logical blocks, without any file-system data structures. This array is some-
times called the raw disk, and I/O to this array is termed raw I/O. Raw I/O
bypasses all the file-system services, such as file I/O demand paging, file
locking, prefetching, space allocation, file names, and directories. Note that
although certain applications are more efficient when implementing their own
special-purpose storage services on a raw partition, most applications perform
better when they use the regular file-system services.


- Each process needs minimum number of frames
- Example:  IBM 370 – 6 pages to handle SS MOVE instruction:
  - instruction is 6 bytes, might span 2 pages
  - 2 pages to handle from
  - 2 pages to handle to
- Maximum of course is total frames in the system
- Two major allocation schemes
  - fixed allocation
  - priority allocation
- Many variations


**Fixed Allocation**

- Equal allocation – For example, if there are 100 frames (after allocating frames for the OS) and 5 processes, give each process 20 frames
  - Keep some as free frame buffer pool
- Proportional allocation – Allocate according to the size of process
  - Dynamic as degree of multiprogramming, process sizes change


**Global vs. Local Allocation**

- Global replacement – process selects a replacement frame from the set of all frames; one process can take a frame from another
  - But then process execution time can vary greatly
  - But greater throughput so more common
- Local replacement – each process selects from only its own set of allocated frames
  - More consistent per-process performance
  - But possibly underutilized memory


**Reclaiming Pages**

- A strategy to implement global page-replacement policy
- All memory requests  are satisfied from the free-frame list,  rather than waiting for the list to drop to zero before we begin selecting pages for replacement,
- Page replacement  is triggered when the list falls below a certain threshold.
- This strategy attempts to ensure there is always sufficient free memory to satisfy new requests.


**Reclaiming Pages Example**



> **[ASSET ch10_ill_023]** Figure from slide 52
> - type: illustration
> - kind: other
> - file: assets/ch10_slide52_img021.jpg
> - src: slides 52
> - shows: Illustration from slide 52
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Non-Uniform Memory Access**

- So far, we assumed that all memory accessed equally
- Many systems are NUMA – speed of access to memory varies
  - Consider system boards containing CPUs and memory, interconnected over a system bus
- NUMA multiprocessing architecture


> **[ASSET ch10_ill_024]** Figure from slide 53
> - type: illustration
> - kind: other
> - file: assets/ch10_slide53_img022.jpg
> - src: slides 53
> - shows: Illustration from slide 53
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Non-Uniform Memory Access (Cont.)**

- Optimal performance comes from allocating memory “close to” the CPU on which the thread is scheduled
  - And modifying the scheduler to schedule the thread on the same system board when possible
  - Solved by Solaris by creating lgroups
    - Structure to track CPU / Memory low latency groups
    - Used my schedule and pager
    - When possible schedule all threads of a process and allocate all memory for that process within the lgroup


## 10.5 Allocation of Frames
> id: ch10-10-5 | src: book 10.5 | kind: concept

We turn next to the issue of allocation. How do we allocate the fixed amount of
free memory among the various processes? If we have 93 free frames and two
processes, how many frames does each process get?
Consider a simple case of a system with 128 frames. The operating system
may take 35, leaving 93 frames for the user process. Under pure demand
paging, all 93 frames would initially be put on the free-frame list. When a user
process started execution, it would generate a sequence of page faults. The first
93 page faults would all get free frames from the free-frame list. When the
free-frame list was exhausted, a page-replacement algorithm would be used
to select one of the 93 in-memory pages to be replaced with the 94th, and so
on. When the process terminated, the 93 frames would once again be placed
on the free-frame list.
There are many variations on this simple strategy. We can require that the
operating system allocate all its buffer and table space from the free-frame list.
When this space is not in use by the operating system, it can be used to support
user paging. We can try to keep three free frames reserved on the free-frame list
at all times. Thus, when a page fault occurs, there is a free frame available to
page into. While the page swap is taking place, a replacement can be selected,
which is then written to the storage device as the user process continues to
execute. Other variants are also possible, but the basic strategy is clear: the
user process is allocated any free frame.
Minimum Number of Frames
Our strategies for the allocation of frames are constrained in various ways.
We cannot, for example, allocate more than the total number of available
frames (unless there is page sharing). We must also allocate at least a minimum
number of frames. Here, we look more closely at the latter requirement.
One reason for allocating at least a minimum number of frames involves
performance. Obviously, as the number of frames allocated to each process
decreases, the page-fault rate increases, slowing process execution. In addi-
tion, remember that, when a page fault occurs before an executing instruction
is complete, the instruction must be restarted. Consequently, we must have
enough frames to hold all the different pages that any single instruction can
reference.
Virtual Memory
For example, consider a machine in which all memory-reference instruc-
tions may reference only one memory address. In this case, we need at least one
frame for the instruction and one frame for the memory reference. In addition,
if one-level indirect addressing is allowed (for example, a load instruction on
frame 16 can refer to an address on frame 0, which is an indirect reference to
frame 23), then paging requires at least three frames per process. (Think about
what might happen if a process had only two frames.)
The minimum number of frames is defined by the computer architecture.
For example, if the move instruction for a given architecture includes more
than one word for some addressing modes, the instruction itself may straddle
two frames. In addition, if each of its two operands may be indirect references,
a total of six frames are required. As another example, the move instruction
for Intel 32- and 64-bit architectures allows data to move only from register to
register and between registers and memory; it does not allow direct memory-
to-memory movement, thereby limiting the required minimum number of
frames for a process.
Whereas the minimum number of frames per process is defined by the
architecture, the maximum number is defined by the amount of available
physical memory. In between, we are still left with significant choice in frame
allocation.
Allocation Algorithms
The easiest way to split m frames among n processes is to give everyone an
equal share, m/n frames (ignoring frames needed by the operating system for
the moment). For instance, if there are 93 frames and 5 processes, each process
will get 18 frames. The 3 leftover frames can be used as a free-frame buffer pool.
This scheme is called equal allocation.
An alternative is to recognize that various processes will need differing
amounts of memory. Consider a system with a 1-KB frame size. If a small
student process of 10 KB and an interactive database of 127 KB are the only
two processes running in a system with 62 free frames, it does not make much
sense to give each process 31 frames. The student process does not need more
than 10 frames, so the other 21 are, strictly speaking, wasted.
To solve this problem, we can use proportional allocation, in which we
allocate available memory to each process according to its size. Let the size of
the virtual memory for process pi be si, and define
S = ∑si.
Then, if the total number of available frames is m, we allocate ai frames to
process pi, where ai is approximately
ai = si/S × m.
Of course, we must adjust each ai to be an integer that is greater than the
minimum number of frames required by the instruction set, with a sum not
exceeding m.
With proportional allocation, we would split 62 frames between two pro-
cesses, one of 10 pages and one of 127 pages, by allocating 4 frames and 57
frames, respectively, since


## 10.5 Allocation of Frames
> id: ch10-10-5 | src: book 10.5 | kind: concept

10/137 × 62 ≈4 and
127/137 × 62 ≈57.
In this way, both processes share the available frames according to their
“needs,” rather than equally.
In both equal and proportional allocation, of course, the allocation may
vary according to the multiprogramming level. If the multiprogramming level
is increased, each process will lose some frames to provide the memory needed
for the new process. Conversely, if the multiprogramming level decreases, the
frames that were allocated to the departed process can be spread over the
remaining processes.
Notice that, with either equal or proportional allocation, a high-priority
process is treated the same as a low-priority process. By its definition, however,
we may want to give the high-priority process more memory to speed its
execution, to the detriment of low-priority processes. One solution is to use
a proportional allocation scheme wherein the ratio of frames depends not on
the relative sizes of processes but rather on the priorities of processes or on a
combination of size and priority.
Global versus Local Allocation
Another important factor in the way frames are allocated to the various pro-
cesses is page replacement. With multiple processes competing for frames, we
can classify page-replacement algorithms into two broad categories: global
replacement and local replacement. Global replacement allows a process to
select a replacement frame from the set of all frames, even if that frame is
currently allocated to some other process; that is, one process can take a frame
from another. Local replacement requires that each process select from only its
own set of allocated frames.
For example, consider an allocation scheme wherein we allow high-
priority processes to select frames from low-priority processes for replacement.
A process can select a replacement from among its own frames or the frames
of any lower-priority process. This approach allows a high-priority process to
increase its frame allocation at the expense of a low-priority process. Whereas
with a local replacement strategy, the number of frames allocated to a process
does not change, with global replacement, a process may happen to select
only frames allocated to other processes, thus increasing the number of frames
allocated to it (assuming that other processes do not choose its frames for
replacement).
One problem with a global replacement algorithm is that the set of pages
in memory for a process depends not only on the paging behavior of that pro-
cess, but also on the paging behavior of other processes. Therefore, the same
process may perform quite differently (for example, taking 0.5 seconds for one
execution and 4.3 seconds for the next execution) because of totally external
circumstances. Such is not the case with a local replacement algorithm. Under
local replacement, the set of pages in memory for a process is affected by the
paging behavior of only that process. Local replacement might hinder a pro-
cess, however, by not making available to it other, less used pages of memory.
Thus, global replacement generally results in greater system throughput. It is
therefore the more commonly used method.
Virtual Memory
MAJOR AND MINOR PAGE FAULTS
As described in Section 10.2.1, a page fault occurs when a page does not
have a valid mapping in the address space of a process. Operating systems
generally distinguish between two types of page faults: major and minor
faults. (Windows refers to major and minor faults as hard and soft faults,
respectively.) A major page fault occurs when a page is referenced and the
page is not in memory. Servicing a major page fault requires reading the
desired page from the backing store into a free frame and updating the page
table. Demand paging typically generates an initially high rate of major page
faults.
Minor page faults occur when a process does not have a logical mapping
to a page, yet that page is in memory. Minor faults can occur for one of two
reasons. First, a process may reference a shared library that is in memory, but
the process does not have a mapping to it in its page table. In this instance,
it is only necessary to update the page table to refer to the existing page in
memory. A second cause of minor faults occurs when a page is reclaimed
from a process and placed on the free-frame list, but the page has not yet
been zeroed out and allocated to another process. When this kind of fault
occurs, the frame is removed from the free-frame list and reassigned to the
process. As might be expected, resolving a minor page fault is typically much
less time consuming than resolving a major page fault.
You can observe the number of major and minor page faults in a Linux
system using the command ps -eo min flt,maj flt,cmd, which outputs
the number of minor and major page faults, as well as the command that
launched the process. An example output of this ps command appears below:
MINFL
MAJFL
CMD
/usr/lib/systemd/systemd-logind
/usr/sbin/sshd -D
vim 10.tex
/sbin/auditd -n
Here, it is interesting to note that, for most commands, the number of major
page faults is generally quite low, whereas the number of minor faults is much
higher. This indicates that Linux processes likely take significant advantage
of shared libraries as, once a library is loaded in memory, subsequent page
faults are only minor faults.
Next, we focus on one possible strategy that we can use to implement a
global page-replacement policy. With this approach, we satisfy all memory
requests from the free-frame list, but rather than waiting for the list to drop to
zero before we begin selecting pages for replacement, we trigger page replace-
ment when the list falls below a certain threshold. This strategy attempts to
ensure there is always sufficient free memory to satisfy new requests.
Such a strategy is depicted in Figure 10.18. The strategy’s purpose is to
keep the amount of free memory above a minimum threshold. When it drops


## 10.5 Allocation of Frames
> id: ch10-10-5 | src: book 10.5 | kind: concept

a
c
b
d
time
maximum
threshold
minimum
threshold
kernel resumes
reclaiming
pages
free memory
kernel suspends
reclaiming
pages
Figure 10.18
Reclaiming pages.
below this threshold, a kernel routine is triggered that begins reclaiming pages
from all processes in the system (typically excluding the kernel). Such kernel
routines are often known as reapers, and they may apply any of the page-
replacement algorithms covered in Section 10.4. When the amount of free
memory reaches the maximum threshold, the reaper routine is suspended, only
to resume once free memory again falls below the minimum threshold.
In Figure 10.18, we see that at point a the amount of free memory drops
below the minimum threshold, and the kernel begins reclaiming pages and
adding them to the free-frame list. It continues until the maximum threshold is
reached (point b). Over time, there are additional requests for memory, and at
point c the amount of free memory again falls below the minimum threshold.
Page reclamation resumes, only to be suspended when the amount of free
memory reaches the maximum threshold (point d). This process continues as
long as the system is running.
As mentioned above, the kernel reaper routine may adopt any page-
replacement algorithm, but typically it uses some form of LRU approximation.
Consider what may happen, though, if the reaper routine is unable to maintain
the list of free frames below the minimum threshold. Under these circum-
Virtual Memory
stances, the reaper routine may begin to reclaim pages more aggressively. For
example, perhaps it will suspend the second-chance algorithm and use pure
FIFO. Another, more extreme, example occurs in Linux; when the amount of
free memory falls to very low levels, a routine known as the out-of-memory
(OOM) killer selects a process to terminate, thereby freeing its memory. How
does Linux determine which process to terminate? Each process has what is
known as an OOM score, with a higher score increasing the likelihood that the
process could be terminated by the OOM killer routine. OOM scores are calcu-
lated according to the percentage of memory a process is using—the higher
the percentage, the higher the OOM score. (OOM scores can be viewed in the
/proc file system, where the score for a process with pid 2500 can be viewed
as /proc/2500/oom score.)
In general, not only can reaper routines vary how aggressively they reclaim
memory, but the values of the minimum and maximum thresholds can be
varied as well. These values can be set to default values, but some systems
may allow a system administrator to configure them based on the amount of
physical memory in the system.
Non-Uniform Memory Access
Thus far in our coverage of virtual memory, we have assumed that all main
memory is created equal—or at least that it is accessed equally. On non-
uniform memory access (NUMA) systems with multiple CPUs (Section 1.3.2),
that is not the case. On these systems, a given CPU can access some sections of
main memory faster than it can access others. These performance differences
are caused by how CPUs and memory are interconnected in the system. Such a
system is made up of multiple CPUs, each with its own local memory (Figure
10.19). The CPUs are organized using a shared system interconnect, and as
you might expect, a CPU can access its local memory faster than memory local
to another CPU. NUMA systems are without exception slower than systems in
which all accesses to main memory are treated equally. However, as described
in Section 1.3.2, NUMA systems can accommodate more CPUs and therefore
achieve greater levels of throughput and parallelism.
CPU0
memory0
CPU2
CPU3
CPU1
memory1
memory2
memory3
interconnect
Figure 10.19
NUMA multiprocessing architecture.


## 10.6 Thrashing
> id: ch10-10-6 | src: book 10.6; slides 55-56 | kind: concept

Managing which page frames are stored at which locations can signifi-
cantly affect performance in NUMA systems. If we treat memory as uniform
in such a system, CPUs may wait significantly longer for memory access than
if we modify memory allocation algorithms to take NUMA into account. We
described some of these modifications in Section 5.5.4. Their goal is to have
memory frames allocated “as close as possible” to the CPU on which the process
is running. (The definition of close is “with minimum latency,” which typically
means on the same system board as the CPU). Thus, when a process incurs a
page fault, a NUMA-aware virtual memory system will allocate that process a
frame as close as possible to the CPU on which the process is running.
To take NUMA into account, the scheduler must track the last CPU on
which each process ran. If the scheduler tries to schedule each process onto
its previous CPU, and the virtual memory system tries to allocate frames for
the process close to the CPU on which it is being scheduled, then improved
cache hits and decreased memory access times will result.
The picture is more complicated once threads are added. For example, a
process with many running threads may end up with those threads scheduled
on many different system boards. How should the memory be allocated in this
case?
As we discussed in Section 5.7.1, Linux manages this situation by having
the kernel identify a hierarchy of scheduling domains. The Linux CFS scheduler
does not allow threads to migrate across different domains and thus incur
memory access penalties. Linux also has a separate free-frame list for each
NUMA node, thereby ensuring that a thread will be allocated memory from the
node on which it is running. Solaris solves the problem similarly by creating
lgroups (for “locality groups”) in the kernel. Each lgroup gathers together
CPUs and memory, and each CPU in that group can access any memory in
the group within a defined latency interval. In addition, there is a hierarchy
of lgroups based on the amount of latency between the groups, similar to the
hierarchy of scheduling domains in Linux. Solaris tries to schedule all threads
of a process and allocate all memory of a process within an lgroup. If that is
not possible, it picks nearby lgroups for the rest of the resources needed. This
practice minimizes overall memory latency and maximizes CPU cache hit rates.


- If a process does not have “enough” pages, the page-fault rate is very high
  - Page fault to get page
  - Replace existing frame
  - But quickly need replaced frame back
  - This leads to:
    - Low CPU utilization
    - Operating system thinking that it needs to increase the degree of multiprogramming
    - Another process added to the system


**Thrashing (Cont.)**

- Thrashing.  A process is busy swapping pages in and out


> **[ASSET ch10_ill_025]** Figure from slide 56
> - type: illustration
> - kind: other
> - file: assets/ch10_slide56_img023.jpg
> - src: slides 56
> - shows: Illustration from slide 56
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 10.6 Thrashing
> id: ch10-10-6 | src: book 10.6 | kind: concept

Consider what occurs if a process does not have “enough” frames—that is, it
does not have the minimum number of frames it needs to support pages in the
working set. The process will quickly page-fault. At this point, it must replace
some page. However, since all its pages are in active use, it must replace a page
that will be needed again right away. Consequently, it quickly faults again, and
again, and again, replacing pages that it must bring back in immediately.
This high paging activity is called thrashing. A process is thrashing if it
is spending more time paging than executing. As you might expect, thrashing
results in severe performance problems.
Cause of Thrashing
Consider the following scenario, which is based on the actual behavior of early
paging systems. The operating system monitors CPU utilization. If CPU utiliza-
Virtual Memory
tion is too low, we increase the degree of multiprogramming by introducing
a new process to the system. A global page-replacement algorithm is used;
it replaces pages without regard to the process to which they belong. Now
suppose that a process enters a new phase in its execution and needs more
frames. It starts faulting and taking frames away from other processes. These
processes need those pages, however, and so they also fault, taking frames from
other processes. These faulting processes must use the paging device to swap
pages in and out. As they queue up for the paging device, the ready queue
empties. As processes wait for the paging device, CPU utilization decreases.
The CPU scheduler sees the decreasing CPU utilization and increases the
degree of multiprogramming as a result. The new process tries to get started by
taking frames from running processes, causing more page faults and a longer
queue for the paging device. As a result, CPU utilization drops even further,
and the CPU scheduler tries to increase the degree of multiprogramming even
more. Thrashing has occurred, and system throughput plunges. The page-
fault rate increases tremendously. As a result, the effective memory-access time
increases. No work is getting done, because the processes are spending all their
time paging.
This phenomenon is illustrated in Figure 10.20, in which CPU utilization
is plotted against the degree of multiprogramming. As the degree of multi-
programming increases, CPU utilization also increases, although more slowly,
until a maximum is reached. If the degree of multiprogramming is increased
further, thrashing sets in, and CPU utilization drops sharply. At this point, to
increase CPU utilization and stop thrashing, we must decrease the degree of
multiprogramming.
We can limit the effects of thrashing by using a local replacement algo-
rithm (or priority replacement algorithm). As mentioned earlier, local replace-
ment requires that each process select from only its own set of allocated frames.
Thus, if one process starts thrashing, it cannot steal frames from another pro-
cess and cause the latter to thrash as well. However, the problem is not entirely
solved. If processes are thrashing, they will be in the queue for the paging
device most of the time. The average service time for a page fault will increase
thrashing
degree of multiprogramming
CPU utilization
Figure 10.20
Thrashing.


## 10.6 Thrashing
> id: ch10-10-6 | src: book 10.6 | kind: concept

because of the longer average queue for the paging device. Thus, the effective
access time will increase even for a process that is not thrashing.
To prevent thrashing, we must provide a process with as many frames as
it needs. But how do we know how many frames it “needs”? One strategy
starts by looking at how many frames a process is actually using. This approach
defines the locality model of process execution.
The locality model states that, as a process executes, it moves from locality
to locality. A locality is a set of pages that are actively used together. A running
program is generally composed of several different localities, which may over-
lap. For example, when a function is called, it defines a new locality. In this
page numbers
execution time
(a)
(b)
Figure 10.21
Locality in a memory-reference pattern.
Virtual Memory
page reference table
. . . 2 6 1 5 7 7 7 7 5 1 6 2 3 4 1 2 3 4 4 4 3 4 3 4 4 4 1 3 2 3 4 4 4 3 4 4 4 . . .
Δ
t1
WS(t1) = {1,2,5,6,7}
Δ
t2
WS(t2) = {3,4}
Figure 10.22
Working-set model.
locality, memory references are made to the instructions of the function call, its
local variables, and a subset of the global variables. When we exit the function,
the process leaves this locality, since the local variables and instructions of the
function are no longer in active use. We may return to this locality later.
Figure 10.21 illustrates the concept of locality and how a process’s
locality changes over time. At time (a), the locality is the set of pages
{18, 19, 20, 21, 22, 23, 24, 29, 30, 33}.
At
time
(b),
the
locality
changes
to
{18, 19, 20, 24, 25, 26, 27, 28, 29, 31, 32, 33}. Notice the overlap, as some pages
(for example, 18, 19, and 20) are part of both localities.
Thus, we see that localities are defined by the program structure and its
data structures. The locality model states that all programs will exhibit this
basic memory reference structure. Note that the locality model is the unstated
principle behind the caching discussions so far in this book. If accesses to any
types of data were random rather than patterned, caching would be useless.
Suppose we allocate enough frames to a process to accommodate its cur-
rent locality. It will fault for the pages in its locality until all these pages are
in memory; then, it will not fault again until it changes localities. If we do
not allocate enough frames to accommodate the size of the current locality,
the process will thrash, since it cannot keep in memory all the pages that it is
actively using.
Working-Set Model
The working-set model is based on the assumption of locality. This model
uses a parameter, Δ, to define the working-set window. The idea is to examine
the most recent Δ page references. The set of pages in the most recent Δ page
references is the working set (Figure 10.22). If a page is in active use, it will be in
the working set. If it is no longer being used, it will drop from the working set
Δ time units after its last reference. Thus, the working set is an approximation
of the program’s locality.
For example, given the sequence of memory references shown in Figure
10.22, if Δ = 10 memory references, then the working set at time t1 is {1, 2, 5,
6, 7}. By time t2, the working set has changed to {3, 4}.
The accuracy of the working set depends on the selection of Δ. If Δ is too
small, it will not encompass the entire locality; if Δ is too large, it may overlap
several localities. In the extreme, if Δ is infinite, the working set is the set of
pages touched during the process execution.
The most important property of the working set, then, is its size. If we
compute the working-set size, WSSi, for each process in the system, we can
then consider that


## 10.6 Thrashing
> id: ch10-10-6 | src: book 10.6 | kind: concept

D = ∑WSSi,
where D is the total demand for frames. Each process is actively using the pages
in its working set. Thus, process i needs WSSi frames. If the total demand is
greater than the total number of available frames (D > m), thrashing will occur,
because some processes will not have enough frames.
Once Δ has been selected, use of the working-set model is simple. The
operating system monitors the working set of each process and allocates to
that working set enough frames to provide it with its working-set size. If there
are enough extra frames, another process can be initiated. If the sum of the
working-set sizes increases, exceeding the total number of available frames,
the operating system selects a process to suspend. The process’s pages are
written out (swapped), and its frames are reallocated to other processes. The
suspended process can be restarted later.
This working-set strategy prevents thrashing while keeping the degree of
multiprogramming as high as possible. Thus, it optimizes CPU utilization. The
difficulty with the working-set model is keeping track of the working set. The
WORKING SETS AND PAGE-FAULT RATES
There is a direct relationship between the working set of a process and its
page-fault rate. Typically, as shown in Figure 10.22, the working set of a
process changes over time as references to data and code sections move from
one locality to another. Assuming there is sufficient memory to store the
working set of a process (that is, the process is not thrashing), the page-fault
rate of the process will transition between peaks and valleys over time. This
general behavior is shown below:
time
working set
page
fault
rate
Apeak in the page-fault rate occurs when we begin demand-paging a new
locality. However, once the working set of this new locality is in memory, the
page-fault rate falls. When the process moves to a new working set, the page-
fault rate rises toward a peak once again, returning to a lower rate once the
new working set is loaded into memory. The span of time between the start
of one peak and the start of the next peak represents the transition from one
working set to another.
Virtual Memory
working-set window is a moving window. At each memory reference, a new
reference appears at one end, and the oldest reference drops off the other end.
A page is in the working set if it is referenced anywhere in the working-set
window.
We can approximate the working-set model with a fixed-interval timer
interrupt and a reference bit. For example, assume that Δ equals 10,000 ref-
erences and that we can cause a timer interrupt every 5,000 references. When
we get a timer interrupt, we copy and clear the reference-bit values for each
page. Thus, if a page fault occurs, we can examine the current reference bit
and two in-memory bits to determine whether a page was used within the last
10,000 to 15,000 references. If it was used, at least one of these bits will be on.
If it has not been used, these bits will be off. Pages with at least one bit on will
be considered to be in the working set.
Note that this arrangement is not entirely accurate, because we cannot tell
where, within an interval of 5,000, a reference occurred. We can reduce the
uncertainty by increasing the number of history bits and the frequency of inter-
rupts (for example, 10 bits and interrupts every 1,000 references). However, the
cost to service these more frequent interrupts will be correspondingly higher.
Page-Fault Frequency
The working-set model is successful, and knowledge of the working set can
be useful for prepaging (Section 10.9.1), but it seems a clumsy way to control
thrashing. A strategy that uses the page-fault frequency (PFF) takes a more
direct approach.
The specific problem is how to prevent thrashing. Thrashing has a high
page-fault rate. Thus, we want to control the page-fault rate. When it is too
high, we know that the process needs more frames. Conversely, if the page-
fault rate is too low, then the process may have too many frames. We can
establish upper and lower bounds on the desired page-fault rate (Figure 10.23).
If the actual page-fault rate exceeds the upper limit, we allocate the process
number of frames
increase number
of frames
upper bound
lower bound
decrease number
of frames
page-fault rate
Figure 10.23
Page-fault frequency.


## 10.7 Memory Compression
> id: ch10-10-7 | src: book 10.7; slides 85-86 | kind: concept

another frame. If the page-fault rate falls below the lower limit, we remove a
frame from the process. Thus, we can directly measure and control the page-
fault rate to prevent thrashing.
As with the working-set strategy, we may have to swap out a process. If the
page-fault rate increases and no free frames are available, we must select some
process and swap it out to backing store. The freed frames are then distributed
to processes with high page-fault rates.
Current Practice
Practically speaking, thrashing and the resulting swapping have a disagreeably
high impact on performance. The current best practice in implementing a
computer system is to include enough physical memory, whenever possible,
to avoid thrashing and swapping. From smartphones through large servers,
providing enough memory to keep all working sets in memory concurrently,
except under extreme conditions, provides the best user experience.


- Memory compression  --  rather than paging out modified frames to swap space, we compress several frames into a single frame, enabling the system to reduce memory usage without resorting to swapping pages.
- Consider the following free-frame-list consisting of 6 frames
- Assume that this number of free frames falls below a certain threshold that triggers page replacement.  The replacement algorithm (say, an LRU approximation algorithm) selects four frames -- 15, 3, 35, and 26 to place on the free-frame list. It first places these frames on a modified-frame list.  Typically, the modified-frame list would next be written to swap space, making the frames available to the free-frame list.  An alternative strategy is to compress a number of frames{\mdash}say, three{\mdash}and store their compressed versions n a single page frame.


> **[ASSET ch10_ill_026]** Figure from slide 85
> - type: illustration
> - kind: other
> - file: assets/ch10_slide85_img033.jpg
> - src: slides 85
> - shows: Illustration from slide 85
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Memory Compression (Cont.)**

- An alternative to paging is memory compression.
- Rather than paging out modified frames to swap space, we compress several frames into a single frame, enabling the system to reduce memory usage without resorting to swapping pages.


> **[ASSET ch10_ill_027]** Figure from slide 86
> - type: illustration
> - kind: other
> - file: assets/ch10_slide86_img034.jpg
> - src: slides 86
> - shows: Illustration from slide 86
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 10.7 Memory Compression
> id: ch10-10-7 | src: book 10.7 | kind: concept

An alternative to paging is memory compression. Here, rather than paging
out modified frames to swap space, we compress several frames into a single
frame, enabling the system to reduce memory usage without resorting to
swapping pages.
In Figure 10.24, the free-frame list contains six frames. Assume that this
number of free frames falls below a certain threshold that triggers page replace-
ment. The replacement algorithm (say, an LRUapproximation algorithm) selects
four frames—15, 3, 35, and 26—to place on the free-frame list. It first places
these frames on a modified-frame list. Typically, the modified-frame list would
next be written to swap space, making the frames available to the free-frame
list. An alternative strategy is to compress a number of frames—say, three—
and store their compressed versions in a single page frame.
In Figure 10.25, frame 7 is removed from the free-frame list. Frames 15,
3, and 35 are compressed and stored in frame 7, which is then stored in the
list of compressed frames. The frames 15, 3, and 35 can now be moved to the
free-frame list. If one of the three compressed frames is later referenced, a page
fault occurs, and the compressed frame is decompressed, restoring the three
pages 15, 3, and 35 in memory.
head
head
free-frame list
modified frame list
Figure 10.24
Free-frame list before compression.
Virtual Memory
head
head
free-frame list
modified frame list
head
compressed frame list
Figure 10.25
Free-frame list after compression
As we have noted, mobile systems generally do not support either stan-
dard swapping or swapping pages. Thus, memory compression is an integral
part of the memory-management strategy for most mobile operating systems,
including Android and iOS. In addition, both Windows 10 and macOS support
memory compression. For Windows 10, Microsoft developed the Universal
Windows Platform (UWP) architecture, which provides a common app plat-
form for devices that run Windows 10, including mobile devices. UWP apps
running on mobile devices are candidates for memory compression. macOS
first supported memory compression with Version 10.9 of the operating sys-
tem, first compressing LRU pages when free memory is short and then paging
if that doesn’t solve the problem. Performance tests indicate that memory com-
pression is faster than paging even to SSD secondary storage on laptop and
desktop macOS systems.
Although memory compression does require allocating free frames to
hold the compressed pages, a significant memory saving can be realized,
depending on the reductions achieved by the compression algorithm. (In the
example above, the three frames were reduced to one-third of their original
size.) As with any form of data compression, there is contention between the
speed of the compression algorithm and the amount of reduction that can be
achieved (known as the compression ratio). In general, higher compression
ratios (greater reductions) can be achieved by slower, more computationally
expensive algorithms. Most algorithms in use today balance these two factors,
achieving relatively high compression ratios using fast algorithms. In addition,
compression algorithms have improved by taking advantage of multiple com-
puting cores and performing compression in parallel. For example, Microsoft’s
Xpress and Apple’s WKdm compression algorithms are considered fast, and
they report compressing pages to 30 to 50 percent of their original size.


## 10.8 Allocating Kernel Memory
> id: ch10-10-8 | src: book 10.8; slides 64-70 | kind: concept

When a process running in user mode requests additional memory, pages are
allocated from the list of free page frames maintained by the kernel. This list
is typically populated using a page-replacement algorithm such as those dis-
cussed in Section 10.4 and most likely contains free pages scattered throughout
physical memory, as explained earlier. Remember, too, that if a user process
requests a single byte of memory, internal fragmentation will result, as the
process will be granted an entire page frame.


- Treated differently from user memory
- Often allocated from a free-memory pool
  - Kernel requests memory for structures of varying sizes
  - Some kernel memory needs to be contiguous
    - i.e., for device I/O


**Buddy System**

- Allocates memory from fixed-size segment consisting of physically-contiguous pages
- Memory allocated using power-of-2 allocator
  - Satisfies requests in units sized as power of 2
  - Request rounded up to next highest power of 2
  - When smaller allocation needed than is available, current chunk split into two buddies of next-lower power of 2
    - Continue until appropriate sized chunk available
- For example, assume 256KB chunk available, kernel requests 21KB
  - Split into AL and AR of 128KB each
    - One further divided into BL and BR of 64KB
      - One further into CL and CR of 32KB each – one used to satisfy request
- Advantage – quickly coalesce unused chunks into larger chunk
- Disadvantage - fragmentation


**Buddy System Allocator**



> **[ASSET ch10_ill_028]** Figure from slide 66
> - type: illustration
> - kind: other
> - file: assets/ch10_slide66_img028.png
> - src: slides 66
> - shows: Illustration from slide 66
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Slab Allocator**

- Alternate strategy
- Slab is one or more physically contiguous pages
- Cache consists of one or more slabs
- Single cache for each unique kernel data structure
  - Each cache filled with objects – instantiations of the data structure
- When cache created, filled with objects marked as free
- When structures stored, objects marked as used
- If slab is full of used objects, next object allocated from empty slab
  - If no empty slabs, new slab allocated
- Benefits include no fragmentation, fast memory request satisfaction


**Slab Allocation**



> **[ASSET ch10_ill_029]** Figure from slide 68
> - type: illustration
> - kind: other
> - file: assets/ch10_slide68_img029.png
> - src: slides 68
> - shows: Illustration from slide 68
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Slab Allocator in Linux**

- For example process descriptor is of type struct task_struct
- Approx 1.7KB of memory
- New task -> allocate new struct from cache
  - Will use existing free struct task_struct
- Slab can be in three possible states
  - Full – all used
  - Empty – all free
  - Partial – mix of free and used
- Upon request, slab allocator
  - Uses free struct in partial slab
  - If none, takes one from empty slab
  - If no empty slab, create new empty


**Slab Allocator in Linux (Cont.)**

- Slab started in Solaris, now wide-spread for both kernel mode and user memory in various OSes
- Linux  2.2 had SLAB, now has both SLOB and SLUB allocators
  - SLOB for systems with limited memory
    - Simple List of Blocks – maintains 3 list objects for small, medium, large objects
  - SLUB is performance-optimized SLAB removes per-CPU queues, metadata stored in page structure


## 10.8 Allocating Kernel Memory
> id: ch10-10-8 | src: book 10.8 | kind: concept

Kernel memory is often allocated from a free-memory pool different from
the list used to satisfy ordinary user-mode processes. There are two primary
reasons for this:
1. The kernel requests memory for data structures of varying sizes, some of
which are less than a page in size. As a result, the kernel must use memory
conservatively and attempt to minimize waste due to fragmentation. This
is especially important because many operating systems do not subject
kernel code or data to the paging system.
2. Pages allocated to user-mode processes do not necessarily have to be in
contiguous physical memory. However, certain hardware devices interact
directly with physical memory—without the benefit of a virtual memory
interface—and consequently may require memory residing in physically
contiguous pages.
In the following sections, we examine two strategies for managing free memory
that is assigned to kernel processes: the “buddy system” and slab allocation.
Buddy System
The buddy system allocates memory from a fixed-size segment consisting of
physically contiguous pages. Memory is allocated from this segment using a
power-of-2 allocator, which satisfies requests in units sized as a power of 2
(4 KB, 8 KB, 16 KB, and so forth). A request in units not appropriately sized is
rounded up to the next highest power of 2. For example, a request for 11 KB is
satisfied with a 16-KB segment.
Let’s consider a simple example. Assume the size of a memory segment
is initially 256 KB and the kernel requests 21 KB of memory. The segment is
initially divided into two buddies—which we will call AL and AR—each 128
KB in size. One of these buddies is further divided into two 64-KB buddies—BL
and BR. However, the next-highest power of 2 from 21 KB is 32 KB so either BL
or BR is again divided into two 32-KB buddies, CL and CR. One of these buddies
is used to satisfy the 21-KB request. This scheme is illustrated in Figure 10.26,
where CL is the segment allocated to the 21-KB request.
An advantage of the buddy system is how quickly adjacent buddies can be
combined to form larger segments using a technique known as coalescing. In
Figure 10.26, for example, when the kernel releases the CL unit it was allocated,
the system can coalesce CL and CR into a 64-KB segment. This segment, BL, can
in turn be coalesced with its buddy BR to form a 128-KB segment. Ultimately,
we can end up with the original 256-KB segment.
The obvious drawback to the buddy system is that rounding up to the next
highest power of 2 is very likely to cause fragmentation within allocated seg-
ments. For example, a 33-KB request can only be satisfied with a 64-KB segment.
In fact, we cannot guarantee that less than 50 percent of the allocated unit will
be wasted due to internal fragmentation. In the following section, we explore
a memory allocation scheme where no space is lost due to fragmentation.
Slab Allocation
A second strategy for allocating kernel memory is known as slab allocation. A
slab is made up of one or more physically contiguous pages. A cache consists
Virtual Memory
physically contiguous pages
256 KB
128 KB
AL
64 KB
BR
64 KB
BL
32 KB
CL
32 KB
CR
128 KB
AR
Figure 10.26
Buddy system allocation.
of one or more slabs. There is a single cache for each unique kernel data struc-
ture—for example, a separate cache for the data structure representing process
descriptors, a separate cache for file objects, a separate cache for semaphores,
and so forth. Each cache is populated with objects that are instantiations of the
kernel data structure the cache represents. For example, the cache represent-
ing semaphores stores instances of semaphore objects, the cache representing
process descriptors stores instances of process descriptor objects, and so forth.
The relationship among slabs, caches, and objects is shown in Figure 10.27. The
figure shows two kernel objects 3 KB in size and three objects 7 KB in size, each
stored in a separate cache.
3-KB
objects
7-KB
objects
kernel objects
caches
slabs
physically
contiguous
pages
Figure 10.27
Slab allocation.


## 10.8 Allocating Kernel Memory
> id: ch10-10-8 | src: book 10.8 | kind: concept

The slab-allocation algorithm uses caches to store kernel objects. When a
cache is created, a number of objects—which are initially marked as free—are
allocated to the cache. The number of objects in the cache depends on the size
of the associated slab. For example, a 12-KB slab (made up of three contiguous
4-KB pages) could store six 2-KB objects. Initially, all objects in the cache are
marked as free. When a new object for a kernel data structure is needed, the
allocator can assign any free object from the cache to satisfy the request. The
object assigned from the cache is marked as used.
Let’s consider a scenario in which the kernel requests memory from the
slab allocator for an object representing a process descriptor. In Linux sys-
tems, a process descriptor is of the type struct task struct, which requires
approximately 1.7 KB of memory. When the Linux kernel creates a new task,
it requests the necessary memory for the struct task struct object from its
cache. The cache will fulfill the request using a struct task struct object
that has already been allocated in a slab and is marked as free.
In Linux, a slab may be in one of three possible states:
1. Full. All objects in the slab are marked as used.
2. Empty. All objects in the slab are marked as free.
3. Partial. The slab consists of both used and free objects.
The slab allocator first attempts to satisfy the request with a free object in a
partial slab. If none exists, a free object is assigned from an empty slab. If no
empty slabs are available, a new slab is allocated from contiguous physical
pages and assigned to a cache; memory for the object is allocated from this
slab.
The slab allocator provides two main benefits:
1. No memory is wasted due to fragmentation. Fragmentation is not an
issue because each unique kernel data structure has an associated cache,
and each cache is made up of one or more slabs that are divided into
chunks the size of the objects being represented. Thus, when the kernel
requests memory for an object, the slab allocator returns the exact amount
of memory required to represent the object.
2. Memory requests can be satisfied quickly. The slab allocation scheme is
thus particularly effective for managing memory when objects are fre-
quently allocated and deallocated, as is often the case with requests from
the kernel. The act of allocating—and releasing—memory can be a time-
consuming process. However, objects are created in advance and thus can
be quickly allocated from the cache. Furthermore, when the kernel has
finished with an object and releases it, it is marked as free and returned
to its cache, thus making it immediately available for subsequent requests
from the kernel.
The slab allocator first appeared in the Solaris 2.4 kernel. Because of its
general-purpose nature, this allocator is now also used for certain user-mode
memory requests in Solaris. Linux originally used the buddy system; however,
beginning with Version 2.2, the Linux kernel adopted the slab allocator. Linux
Virtual Memory
refers to its slab implementation as SLAB. Recent distributions of Linux include
two other kernel memory allocators—the SLOB and SLUB allocators.
The SLOB allocator is designed for systems with a limited amount of mem-
ory, such as embedded systems. SLOB (which stands for “simple list of blocks”)
maintains three lists of objects: small (for objects less than 256 bytes), medium
(for objects less than 1,024 bytes), and large (for all other objects less than the
size of a page). Memory requests are allocated from an object on the appropri-
ate list using a first-fit policy.
Beginning with Version 2.6.24, the SLUB allocator replaced SLAB as the
default allocator for the Linux kernel. SLUB reduced much of the overhead
required by the SLAB allocator. For instance, whereas SLAB stores certain meta-
data with each slab, SLUB stores these data in the page structure the Linux
kernel uses for each page. Additionally, SLUB does not include the per-CPU
queues that the SLAB allocator maintains for objects in each cache. For systems
with a large number of processors, the amount of memory allocated to these
queues is significant. Thus, SLUB provides better performance as the number
of processors on a system increases.


## 10.9 Other Considerations
> id: ch10-10-9 | src: book 10.9; slides 71-81 | kind: concept

The major decisions that we make for a paging system are the selections of
a replacement algorithm and an allocation policy, which we discussed earlier
in this chapter. There are many other considerations as well, and we discuss
several of them here.
Prepaging
An obvious property of pure demand paging is the large number of page faults
that occur when a process is started. This situation results from trying to get
the initial locality into memory. Prepaging is an attempt to prevent this high
level of initial paging. The strategy is to bring some—or all—of the pages that
will be needed into memory at one time.
In a system using the working-set model, for example, we could keep with
each process a list of the pages in its working set. If we must suspend a process
(due to a lack of free frames), we remember the working set for that process.
When the process is to be resumed (because I/O has finished or enough free
frames have become available), we automatically bring back into memory its
entire working set before restarting the process.
Prepaging may offer an advantage in some cases. The question is simply
whether the cost of using prepaging is less than the cost of servicing the
corresponding page faults. It may well be the case that many of the pages
brought back into memory by prepaging will not be used.
Assume that s pages are prepaged and a fraction α of these s pages is
actually used (0 ≤α ≤1). The question is whether the cost of the s * α saved
page faults is greater or less than the cost of prepaging s * (1 −α) unnecessary
pages. If α is close to 0, prepaging loses; if α is close to 1, prepaging wins.
Note also that prepaging an executable program may be difficult, as it
may be unclear exactly what pages should be brought in. Prepaging a file
may be more predictable, since files are often accessed sequentially. The Linux


- Prepaging
- Page size
- TLB reach
- Inverted page table
- Program structure
- I/O interlock and page locking


**Prepaging**

- To reduce the large number of page faults that occurs at process startup
- Prepage all or some of the pages a process will need, before they are referenced
- But if prepaged pages are unused, I/O and memory was wasted
- Assume s pages are prepaged and α of the pages is used
  - Is cost of s * α  save pages faults > or < than the cost of prepaging s * (1- α) unnecessary pages?
  - α near zero  prepaging loses


**Page Size**

- Sometimes OS designers have a choice
  - Especially if running on custom-built CPU
- Page size selection must take into consideration:
  - Fragmentation
  - Page table size
  - Resolution
  - I/O overhead
  - Number of page faults
  - Locality
  - TLB size and effectiveness
- Always power of 2, usually in the range 212 (4,096 bytes) to 222 (4,194,304 bytes)
- On average, growing over time


**TLB Reach**

- TLB Reach - The amount of memory accessible from the TLB
- TLB Reach = (TLB Size) X (Page Size)
- Ideally, the working set of each process is stored in the TLB
  - Otherwise there is a high degree of page faults
- Increase the Page Size
  - This may lead to an increase in fragmentation as not all applications require a large page size
- Provide Multiple Page Sizes
  - This allows applications that require larger page sizes the opportunity to use them without an increase in fragmentation


**Program Structure**

- Program structure
  - int[128,128] data;
  - Each row is stored in one page
  - Program 1
- for (j = 0; j <128; j++)                  for (i = 0; i < 128; i++)                        data[i,j] = 0;
  - 128 x 128 = 16,384 page faults
  - Program 2
  - for (i = 0; i < 128; i++)               for (j = 0; j < 128; j++)                     data[i,j] = 0;
  - 128 page faults


**I/O interlock**

- I/O Interlock – Pages must sometimes be locked into memory
- Consider I/O - Pages that are used for copying a file from a device must be locked from being selected for eviction by a page replacement algorithm
- Pinning of pages to lock into memory


> **[ASSET ch10_ill_030]** Figure from slide 76
> - type: illustration
> - kind: other
> - file: assets/ch10_slide76_img030.png
> - src: slides 76
> - shows: Illustration from slide 76
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Operating System Examples**

- Windows
- Solaris


**Windows**

- Uses demand paging with clustering. Clustering brings in pages surrounding the faulting page
- Processes are assigned working set minimum and working set maximum
- Working set minimum is the minimum number of pages the process is guaranteed to have in memory
- A process may be assigned as many pages up to its working set maximum
- When the amount of free memory in the system falls below a threshold, automatic working set trimming is performed to restore the amount of free memory
- Working set trimming removes pages from processes that have pages in excess of their working set minimum


**Solaris**

- Maintains a list of free pages to assign faulting processes
- Lotsfree – threshold parameter (amount of free memory) to begin paging
- Desfree – threshold parameter to increasing paging
- Minfree – threshold parameter to being swapping
- Paging is performed by pageout process
- Pageout scans pages using modified clock algorithm
- Scanrate is the rate at which pages are scanned. This ranges from slowscan to fastscan
- Pageout is called more frequently depending upon the amount of free memory available
- Priority paging gives priority to process code pages


**Solaris 2 Page Scanner**



> **[ASSET ch10_ill_031]** Figure from slide 80
> - type: illustration
> - kind: other
> - file: assets/ch10_slide80_img031.png
> - src: slides 80
> - shows: Illustration from slide 80
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**End of Chapter 10**



## 10.9 Other Considerations
> id: ch10-10-9 | src: book 10.9 | kind: concept

readahead() system call prefetches the contents of a file into memory so that
subsequent accesses to the file will take place in main memory.
Page Size
The designers of an operating system for an existing machine seldom have
a choice concerning the page size. However, when new machines are being
designed, a decision regarding the best page size must be made. As you might
expect, there is no single best page size. Rather, there is a set of factors that
support various sizes. Page sizes are invariably powers of 2, generally ranging
from 4,096 (212) to 4,194,304 (222) bytes.
How do we select a page size? One concern is the size of the page table. For
a given virtual memory space, decreasing the page size increases the number
of pages and hence the size of the page table. For a virtual memory of 4 MB (222),
for example, there would be 4,096 pages of 1,024 bytes but only 512 pages of
8,192 bytes. Because each active process must have its own copy of the page
table, a large page size is desirable.
Memory is better utilized with smaller pages, however. If a process is
allocated memory starting at location 00000 and continuing until it has as much
as it needs, it probably will not end exactly on a page boundary. Thus, a part
of the final page must be allocated (because pages are the units of allocation)
but will be unused (creating internal fragmentation). Assuming independence
of process size and page size, we can expect that, on the average, half of the
final page of each process will be wasted. This loss is only 256 bytes for a page
of 512 bytes but is 4,096 bytes for a page of 8,192 bytes. To minimize internal
fragmentation, then, we need a small page size.
Another problem is the time required to read or write a page. As you will
see in Section 11.1, when the storage device is an HDD, I/O time is composed of
seek, latency, and transfer times. Transfer time is proportional to the amount
transferred (that is, the page size)—a fact that would seem to argue for a small
page size. However, latency and seek time normally dwarf transfer time. At
a transfer rate of 50 MB per second, it takes only 0.01 milliseconds to transfer
512 bytes. Latency time, though, is perhaps 3 milliseconds, and seek time 5
milliseconds. Of the total I/O time (8.01 milliseconds), therefore, only about 0.1
percent is attributable to the actual transfer. Doubling the page size increases
I/O time to only 8.02 milliseconds. It takes 8.02 milliseconds to read a single
page of 1,024 bytes but 16.02 milliseconds to read the same amount as two
pages of 512 bytes each. Thus, a desire to minimize I/O time argues for a larger
page size.
With a smaller page size, though, total I/O should be reduced, since locality
will be improved. A smaller page size allows each page to match program
locality more accurately. For example, consider a process 200 KB in size, of
which only half (100 KB) is actually used in an execution. If we have only
one large page, we must bring in the entire page, a total of 200 KB transferred
and allocated. If instead we had pages of only 1 byte, then we could bring in
only the 100 KB that are actually used, resulting in only 100 KB transferred and
allocated. With a smaller page size, then, we have better resolution, allowing
us to isolate only the memory that is actually needed. With a larger page size,
we must allocate and transfer not only what is needed but also anything else
Virtual Memory
that happens to be in the page, whether it is needed or not. Thus, a smaller
page size should result in less I/O and less total allocated memory.
But did you notice that with a page size of 1 byte, we would have a page
fault for each byte? A process of 200 KB that used only half of that memory
would generate only one page fault with a page size of 200 KB but 102,400 page
faults with a page size of 1 byte. Each page fault generates the large amount
of overhead needed for processing the interrupt, saving registers, replacing
a page, queuing for the paging device, and updating tables. To minimize the
number of page faults, we need to have a large page size.
Other factors must be considered as well (such as the relationship between
page size and sector size on the paging device). The problem has no best
answer. As we have seen, some factors (internal fragmentation, locality) argue
for a small page size, whereas others (table size, I/O time) argue for a large
page size. Nevertheless, the historical trend is toward larger page sizes, even
for mobile systems. Indeed, the first edition of Operating System Concepts (1983)
used 4,096 bytes as the upper bound on page sizes, and this value was the most
common page size in 1990. Modern systems may now use much larger page
sizes, as you will see in the following section.
TLB Reach
In Chapter 9, we introduced the hit ratio of the TLB. Recall that the hit ratio
for the TLB refers to the percentage of virtual address translations that are
resolved in the TLB rather than the page table. Clearly, the hit ratio is related
to the number of entries in the TLB, and the way to increase the hit ratio is
by increasing the number of entries. This, however, does not come cheaply, as
the associative memory used to construct the TLB is both expensive and power
hungry.
Related to the hit ratio is a similar metric: the TLB reach. The TLB reach
refers to the amount of memory accessible from the TLB and is simply the
number of entries multiplied by the page size. Ideally, the working set for a
process is stored in the TLB. If it is not, the process will spend a considerable
amount of time resolving memory references in the page table rather than
the TLB. If we double the number of entries in the TLB, we double the TLB
reach. However, for some memory-intensive applications, this may still prove
insufficient for storing the working set.
Another approach for increasing the TLB reach is to either increase the size
of the page or provide multiple page sizes. If we increase the page size—say,
from 4 KB to 16 KB—we quadruple the TLB reach. However, this may lead to an
increase in fragmentation for some applications that do not require such a large
page size. Alternatively, most architectures provide support for more than one
page size, and an operating system can be configured to take advantage of this
support. For example, the default page size on Linux systems is 4 KB; however,
Linux also provides huge pages, a feature that designates a region of physical
memory where larger pages (for example, 2 MB) may be used.
Recall from Section 9.7 that the ARMv8 architecture provides support for
pages and regions of different sizes. Additionally, each TLB entry in the ARMv8
contains a contiguous bit. If this bit is set for a particular TLB entry, that entry
maps contiguous (adjacent) blocks of memory. Three possible arrangements of


## 10.9 Other Considerations
> id: ch10-10-9 | src: book 10.9 | kind: concept

contiguous blocks can be mapped in a single TLB entry, thereby increasing the
TLB reach:
1. 64-KB TLB entry comprising 16 × 4 KB adjacent blocks.
2. 1-GB TLB entry comprising 32 × 32 MB adjacent blocks.
3. 2-MB TLB entry comprising either 32 × 64 KB adjacent blocks, or 128 × 16
KB adjacent blocks.
Providing support for multiple page sizes may require the operating sys-
tem—rather than hardware—to manage the TLB. For example, one of the fields
in a TLB entry must indicate the size of the page frame corresponding to the
entry—or, in the case of ARM architectures, must indicate that the entry refers
to a contiguous block of memory. Managing the TLB in software and not hard-
ware comes at a cost in performance. However, the increased hit ratio and TLB
reach offset the performance costs.
Inverted Page Tables
Section 9.4.3 introduced the concept of the inverted page table. The purpose
of this form of page management is to reduce the amount of physical memory
needed to track virtual-to-physical address translations. We accomplish this
savings by creating a table that has one entry per page of physical memory,
indexed by the pair <process-id, page-number>.
Because they keep information about which virtual memory page is stored
in each physical frame, inverted page tables reduce the amount of physical
memory needed to store this information. However, the inverted page table
no longer contains complete information about the logical address space of a
process, and that information is required if a referenced page is not currently in
memory. Demand paging requires this information to process page faults. For
the information to be available, an external page table (one per process) must
be kept. Each such table looks like the traditional per-process page table and
contains information on where each virtual page is located.
But do external page tables negate the utility of inverted page tables? Since
these tables are referenced only when a page fault occurs, they do not need to
be available quickly. Instead, they are themselves paged in and out of memory
as necessary. Unfortunately, a page fault may now cause the virtual memory
manager to generate another page fault as it pages in the external page table it
needs to locate the virtual page on the backing store. This special case requires
careful handling in the kernel and a delay in the page-lookup processing.
Program Structure
Demand paging is designed to be transparent to the user program. In many
cases, the user is completely unaware of the paged nature of memory. In other
cases, however, system performance can be improved if the user (or compiler)
has an awareness of the underlying demand paging.
Let’s look at a contrived but informative example. Assume that pages are
128 words in size. Consider a C program whose function is to initialize to 0
each element of a 128-by-128 array. The following code is typical:
Virtual Memory
int i, j;
int[128][128] data;
for (j = 0; j < 128; j++)
for (i = 0; i < 128; i++)
data[i][j] = 0;
Notice that the array is stored row major; that is, the array is stored
data[0][0], data[0][1], · · ·, data[0][127], data[1][0], data[1][1], · · ·,
data[127][127]. For pages of 128 words, each row takes one page. Thus, the
preceding code zeros one word in each page, then another word in each page,
and so on. If the operating system allocates fewer than 128 frames to the entire
program, then its execution will result in 128 × 128 = 16,384 page faults.
In contrast, suppose we change the code to
int i, j;
int[128][128] data;
for (i = 0; i < 128; i++)
for (j = 0; j < 128; j++)
data[i][j] = 0;
This code zeros all the words on one page before starting the next page,
reducing the number of page faults to 128.
Careful selection of data structures and programming structures can
increase locality and hence lower the page-fault rate and the number of
pages in the working set. For example, a stack has good locality, since access
is always made to the top. A hash table, in contrast, is designed to scatter
references, producing bad locality. Of course, locality of reference is just one
measure of the efficiency of the use of a data structure. Other heavily weighted
factors include search speed, total number of memory references, and total
number of pages touched.
At a later stage, the compiler and loader can have a significant effect on
paging. Separating code and data and generating reentrant code means that
code pages can be read-only and hence will never be modified. Clean pages
do not have to be paged out to be replaced. The loader can avoid placing
routines across page boundaries, keeping each routine completely in one page.
Routines that call each other many times can be packed into the same page.
This packaging is a variant of the bin-packing problem of operations research:
try to pack the variable-sized load segments into the fixed-sized pages so that
interpage references are minimized. Such an approach is particularly useful for
large page sizes.
I/O Interlock and Page Locking
When demand paging is used, we sometimes need to allow some of the pages
to be locked in memory. One such situation occurs when I/O is done to or from
user (virtual) memory. I/O is often implemented by a separate I/O processor.
For example, a controller for a USB storage device is generally given the number


## 10.9 Other Considerations
> id: ch10-10-9 | src: book 10.9 | kind: concept

of bytes to transfer and a memory address for the buffer (Figure 10.28). When
the transfer is complete, the CPU is interrupted.
We must be sure the following sequence of events does not occur: Aprocess
issues an I/O request and is put in a queue for that I/O device. Meanwhile, the
CPU is given to other processes. These processes cause page faults, and one of
them, using a global replacement algorithm, replaces the page containing the
memory buffer for the waiting process. The pages are paged out. Some time
later, when the I/O request advances to the head of the device queue, the I/O
occurs to the specified address. However, this frame is now being used for a
different page belonging to another process.
There are two common solutions to this problem. One solution is never to
execute I/O to user memory. Instead, data are always copied between system
memory and user memory. I/O takes place only between system memory and
the I/O device. Thus, to write a block on tape, we first copy the block to
system memory and then write it to tape. This extra copying may result in
unacceptably high overhead.
Another solution is to allow pages to be locked into memory. Here, a lock
bit is associated with every frame. If the frame is locked, it cannot be selected
for replacement. Under this approach, to write a block to disk, we lock into
memory the pages containing the block. The system can then continue as usual.
Locked pages cannot be replaced. When the I/O is complete, the pages are
unlocked.
Lock bits are used in various situations. Frequently, some or all of the
operating-system kernel is locked into memory. Many operating systems can-
not tolerate a page fault caused by the kernel or by a specific kernel module,
including the one performing memory management. User processes may also
need to lock pages into memory. A database process may want to manage a
chunk of memory, for example, moving blocks between secondary storage and
buffer
disk drive
Figure 10.28
The reason why frames used for I/O must be in memory.
Virtual Memory
memory itself because it has the best knowledge of how it is going to use its
data. Such pinning of pages in memory is fairly common, and most operating
systems have a system call allowing an application to request that a region
of its logical address space be pinned. Note that this feature could be abused
and could cause stress on the memory-management algorithms. Therefore, an
application frequently requires special privileges to make such a request.
Another use for a lock bit involves normal page replacement. Consider
the following sequence of events: A low-priority process faults. Selecting a
replacement frame, the paging system reads the necessary page into memory.
Ready to continue, the low-priority process enters the ready queue and waits
for the CPU. Since it is a low-priority process, it may not be selected by the
CPU scheduler for a time. While the low-priority process waits, a high-priority
process faults. Looking for a replacement, the paging system sees a page that
is in memory but has not been referenced or modified: it is the page that the
low-priority process just brought in. This page looks like a perfect replacement.
It is clean and will not need to be written out, and it apparently has not been
used for a long time.
Whether the high-priority process should be able to replace the low-
priority process is a policy decision. After all, we are simply delaying the
low-priority process for the benefit of the high-priority process. However, we
are wasting the effort spent to bring in the page for the low-priority process.
If we decide to prevent replacement of a newly brought-in page until it can be
used at least once, then we can use the lock bit to implement this mechanism.
When a page is selected for replacement, its lock bit is turned on. It remains on
until the faulting process is again dispatched.
Using a lock bit can be dangerous: the lock bit may get turned on but
never turned off. Should this situation occur (because of a bug in the operating
system, for example), the locked frame becomes unusable. For instance, Solaris
allows locking “hints,” but it is free to disregard these hints if the free-frame
pool becomes too small or if an individual process requests that too many pages
be locked in memory.


## 10.10 Operating-System Examples
> id: ch10-10-10 | src: book 10.10 | kind: concept

In this section, we describe how Linux, Windows and Solaris manage virtual
memory.
Linux
In Section 10.8.2, we discussed how Linux manages kernel memory using slab
allocation. We now cover how Linux manages virtual memory. Linux uses
demand paging, allocating pages from a list of free frames. In addition, it uses
a global page-replacement policy similar to the LRU-approximation clock algo-
rithm described in Section 10.4.5.2. To manage memory, Linux maintains two
types of page lists: an active list and an inactive list. The active list
contains the pages that are considered in use, while the inactive list con-
tains pages that have not recently been referenced and are eligible to be
reclaimed.
Operating-System Examples
rear
new
page
inactive_list
active_list
referenced
referenced
rear
front
front
Figure 10.29
The Linux active list and inactive list structures.
Each page has an accessed bit that is set whenever the page is referenced.
(The actual bits used to mark page access vary by architecture.) When a page
is first allocated, its accessed bit is set, and it is added to the rear of the
active list. Similarly, whenever a page in the active list is referenced,
its accessed bit is set, and the page moves to the rear of the list. Periodically,
the accessed bits for pages in the active list are reset. Over time, the least
recently used page will be at the front of the active list. From there, it may
migrate to the rear of the inactive list. If a page in the inactive list
is referenced, it moves back to the rear of the active list. This pattern is
illustrated in Figure 10.29.
The two lists are kept in relative balance, and when the active list grows
much larger than the inactive list, pages at the front of the active list
move to the inactive list, where they become eligible for reclamation. The
Linux kernel has a page-out daemon process kswapd that periodically awak-
ens and checks the amount of free memory in the system. If free memory
falls below a certain threshold, kswapd begins scanning pages in the inac-
tive list and reclaiming them for the free list. Linux virtual memory man-
agement is discussed in greater detail in Chapter 20.
Windows
Windows 10 supports 32- and 64-bit systems running on Intel (IA-32 and x86-
64) and ARM architectures. On 32-bit systems, the default virtual address space
of a process is 2 GB, although it can be extended to 3 GB. 32-bit systems support
4 GB of physical memory. On 64-bit systems, Windows 10 has a 128-TB vir-
tual address space and supports up to 24 TB of physical memory. (Versions of
Windows Server support up to 128 TB of physical memory.) Windows 10 imple-
ments most of the memory-management features described thus far, including
shared libraries, demand paging, copy-on-write, paging, and memory com-
pression.
Virtual Memory
Windows 10 implements virtual memory using demand paging with clus-
tering, a strategy that recognizes locality of memory references and therefore
handles page faults by bringing in not only the faulting page but also several
pages immediately preceding and following the faulting page. The size of a
cluster varies by page type. For a data page, a cluster contains three pages(the
page before and the page after the faulting page); all other page faults have a
cluster size of seven.
A key component of virtual memory management in Windows 10 is
working-set management. When a process is created, it is assigned a working-
set minimum of 50 pages and a working-set maximum of 345 pages. The
working-set minimum is the minimum number of pages the process is guar-
anteed to have in memory; if sufficient memory is available, a process may be
assigned as many pages as its working-set maximum. Unless a process is con-
figured with hard working-set limits, these values may be ignored. A process
can grow beyond its working-set maximum if sufficient memory is available.
Similarly, the amount of memory allocated to a process can shrink below the
minimum in periods of high demand for memory.
Windows uses the LRU-approximation clock algorithm, as described in Sec-
tion 10.4.5.2, with a combination of local and global page-replacement policies.
The virtual memory manager maintains a list of free page frames. Associated
with this list is a threshold value that indicates whether sufficient free memory
is available. If a page fault occurs for a process that is below its working-
set maximum, the virtual memory manager allocates a page from the list of
free pages. If a process that is at its working-set maximum incurs a page fault
and sufficient memory is available, the process is allocated a free page, which
allows it to grow beyond its working-set maximum. If the amount of free mem-
ory is insufficient, however, the kernel must select a page from the process’s
working set for replacement using a local LRU page-replacement policy.
When the amount of free memory falls below the threshold, the vir-
tual memory manager uses a global replacement tactic known as automatic
working-set trimming to restore the value to a level above the threshold.
Automatic working-set trimming works by evaluating the number of pages
allocated to processes. If a process has been allocated more pages than its
working-set minimum, the virtual memory manager removes pages from the
working set until either there is sufficient memory available or the process has
reached its working-set minimum. Larger processes that have been idle are
targeted before smaller, active processes. The trimming procedure continues
until there is sufficient free memory, even if it is necessary to remove pages
from a process already below its working set minimum. Windows performs
working-set trimming on both user-mode and system processes.
Solaris
In Solaris, when a thread incurs a page fault, the kernel assigns a page to
the faulting thread from the list of free pages it maintains. Therefore, it is
imperative that the kernel keep a sufficient amount of free memory available.
Associated with this list of free pages is a parameter—lotsfree—that repre-
sents a threshold to begin paging. The lotsfree parameter is typically set to
1∕64 the size of the physical memory. Four times per second, the kernel checks
whether the amount of free memory is less than lotsfree. If the number of
Operating-System Examples
free pages falls below lotsfree, a process known as a pageout starts up. The
pageout process is similar to the second-chance algorithm described in Section
10.4.5.2, except that it uses two hands while scanning pages, rather than one.
The pageout process works as follows: The front hand of the clock scans
all pages in memory, setting the reference bit to 0. Later, the back hand of the
clock examines the reference bit for the pages in memory, appending each page
whose reference bit is still set to 0 to the free list and writing its contents to
secondary storage if it has been modified. Solaris also manages minor page
faults by allowing a process to reclaim a page from the free list if the page is
accessed before being reassigned to another process.
The pageout algorithm uses several parameters to control the rate at which
pages are scanned (known as the scanrate). The scanrate is expressed in
pages per second and ranges from slowscan to fastscan. When free memory
falls below lotsfree, scanning occurs at slowscan pages per second and
progresses to fastscan, depending on the amount of free memory available.
The default value of slowscan is 100 pages per second. Fastscan is typically
set to the value (total physical pages)/2 pages per second, with a maximum of
maximum).
The distance (in pages) between the hands of the clock is determined
by a system parameter, handspread. The amount of time between the front
hand’s clearing a bit and the back hand’s investigating its value depends on
the scanrate and the handspread. If scanrate is 100 pages per second and
handspread is 1,024 pages, 10 seconds can pass between the time a bit is set by
the front hand and the time it is checked by the back hand. However, because
of the demands placed on the memory system, a scanrate of several thousand
is not uncommon. This means that the amount of time between clearing and
investigating a bit is often a few seconds.
minfree
scan rate
slowscan
fastscan
desfree
amount of free memory
lotsfree
Figure 10.30
Solaris page scanner.
Virtual Memory
As mentioned above, the pageout process checks memory four times per
second. However, if free memory falls below the value of desfree (the desired
amount of free memory in the system), pageout will run a hundred times per
second with the intention of keeping at least desfree free memory available
(Figure 10.30). If the pageout process is unable to keep the amount of free
memory at desfree for a 30-second average, the kernel begins swapping
processes, thereby freeing all pages allocated to swapped processes. In general,
the kernel looks for processes that have been idle for long periods of time. If
the system is unable to maintain the amount of free memory at minfree, the
pageout process is called for every request for a new page.
The page-scanning algorithm skips pages belonging to libraries that are
being shared by several processes, even if they are eligible to be claimed by the
scanner. The algorithm also distinguishes between pages allocated to processes
and pages allocated to regular data files. This is known as priority paging and
is covered in Section 14.6.2.


## Chapter Summary
> id: ch10-chapter-summary | src: book Chapter Summary | kind: concept

• Virtual memory abstracts physical memory into an extremely large uni-
form array of storage.
• The benefits of virtual memory include the following: (1) a program can be
larger than physical memory, (2) a program does not need to be entirely in
memory, (3) processes can share memory, and (4) processes can be created
more efficiently.
• Demand paging is a technique whereby pages are loaded only when they
are demanded during program execution. Pages that are never demanded
are thus never loaded into memory.
• A page fault occurs when a page that is currently not in memory is
accessed. The page must be brought from the backing store into an avail-
able page frame in memory.
• Copy-on-write allows a child process to share the same address space as
its parent. If either the child or the parent process writes (modifies) a page,
a copy of the page is made.
• When available memory runs low, a page-replacement algorithm
selects an existing page in memory to replace with a new page. Page-
replacement algorithms include
FIFO, optimal, and
LRU. Pure LRU
algorithms are impractical to implement, and most systems instead use
LRU-approximation algorithms.
• Global page-replacement algorithms select a page from any process in the
system for replacement, while local page-replacement algorithms select a
page from the faulting process.
• Thrashing occurs when a system spends more time paging than executing.
• A locality represents a set of pages that are actively used together. As a
process executes, it moves from locality to locality. A working set is based
on locality and is defined as the set of pages currently in use by a process.


## Practice Exercises
> id: ch10-practice-exercises | src: book Practice Exercises | kind: concept

• Memory compression is a memory-management technique that com-
presses a number of pages into a single page. Compressed memory is an
alternative to paging and is used on mobile systems that do not support
paging.
• Kernel memory is allocated differently than user-mode processes; it is allo-
cated in contiguous chunks of varying sizes. Two common techniques for
allocating kernel memory are (1) the buddy system and (2) slab allocation.
• TLB reach refers to the amount of memory accessible from the TLB and is
equal to the number of entries in the TLB multiplied by the page size. One
technique for increasing TLB reach is to increase the size of pages.
• Linux, Windows, and Solaris manage virtual memory similarly, using
demand paging and copy-on-write, among other features. Each system
also uses a variation of LRU approximation known as the clock algorithm.


## Practice Exercises
> id: ch10-practice-exercises | src: book Practice Exercises | kind: concept




## 10.1 Under what circumstances do page faults occur? Describe the actions
> id: ch10-10-1 | src: book 10.1 | kind: concept

taken by the operating system when a page fault occurs.


## 10.2 Assume that you have a page-reference string for a process with m
> id: ch10-10-2 | src: book 10.2 | kind: concept

frames (initially all empty). The page-reference string has length p, and
n distinct page numbers occur in it. Answer these questions for any
page-replacement algorithms:
a.
What is a lower bound on the number of page faults?
b.
What is an upper bound on the number of page faults?


## 10.3 Consider the following page-replacement algorithms. Rank these algo-
> id: ch10-10-3 | src: book 10.3 | kind: concept

rithms on a five-point scale from “bad” to “perfect” according to their
page-fault rate. Separate those algorithms that suffer from Belady’s
anomaly from those that do not.
a.
LRU replacement
b.
FIFO replacement
c.
Optimal replacement
d.
Second-chance replacement


## 10.4 An operating system supports a paged virtual memory. The central
> id: ch10-10-4 | src: book 10.4; slides 5-9 | kind: concept

processor has a cycle time of 1 microsecond. It costs an additional 1
microsecond to access a page other than the current one. Pages have
1,000 words, and the paging device is a drum that rotates at 3,000
revolutions per minute and transfers 1 million words per second. The
following statistical measurements were obtained from the system:
• One percent of all instructions executed accessed a page other than
the current page.
• Of the instructions that accessed another page, 80 percent accessed
a page already in memory.
Virtual Memory
• When a new page was required, the replaced page was modified
50 percent of the time.
Calculate the effective instruction time on this system, assuming that
the system is running one process only and that the processor is idle
during drum transfers.


- Virtual memory – separation of user logical memory from physical memory
  - Only part of the program needs to be in memory for execution
  - Logical address space can therefore be much larger than physical address space
  - Allows address spaces to be shared by several processes
  - Allows for more efficient process creation
  - More programs running concurrently
  - Less I/O needed to load or swap processes


**Virtual memory  (Cont.)**

- Virtual address space – logical view of how process is stored in memory
  - Usually start at address 0, contiguous addresses until end of space
  - Meanwhile, physical memory organized in page frames
  - MMU must map logical to physical
- Virtual memory can be implemented via:
  - Demand paging
  - Demand segmentation


**Virtual Memory That is Larger Than Physical Memory**



> **[ASSET ch10_ill_032]** Figure from slide 7
> - type: illustration
> - kind: other
> - file: assets/ch10_slide07_img001.jpg
> - src: slides 7
> - shows: Illustration from slide 7
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Virtual-address Space**

- Usually design logical address space for stack to start at Max logical address and grow “down” while heap grows “up”
  - Maximizes address space use
  - Unused address space between the two is hole
    - No physical memory needed until heap or stack grows to a given new page
- Enables sparse address spaces with holes left for growth, dynamically linked libraries, etc.
- System libraries shared via mapping into virtual address space
- Shared memory by mapping pages read-write into virtual address space
- Pages can be shared during fork(), speeding process creation


> **[ASSET ch10_ill_033]** Figure from slide 8
> - type: illustration
> - kind: other
> - file: assets/ch10_slide08_img002.png
> - src: slides 8
> - shows: Illustration from slide 8
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Shared Library Using Virtual Memory**



> **[ASSET ch10_ill_034]** Figure from slide 9
> - type: illustration
> - kind: other
> - file: assets/ch10_slide09_img003.png
> - src: slides 9
> - shows: Illustration from slide 9
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 10.5 Consider the page table for a system with 12-bit virtual and physical
> id: ch10-10-5 | src: book 10.5 | kind: concept

addresses and 256-byte pages.
Page
Page Frame
–
C
A
–
–
B
The list of free page frames is D, E, F (that is, D is at the head of the list,
E is second, and F is last). A dash for a page frame indicates that the
page is not in memory.
Convert the following virtual addresses to their equivalent physical
addresses in hexadecimal. All numbers are given in hexadecimal.
• 9EF
• 111
• 700
• 0FF


## 10.6 Discuss the hardware functions required to support demand paging.
> id: ch10-10-6 | src: book 10.6 | kind: concept




## 10.7 Consider the two-dimensional array A:
> id: ch10-10-7 | src: book 10.7 | kind: concept

int A[][] = new int[100][100];
where A[0][0] is at location 200 in a paged memory system with pages
of size 200. A small process that manipulates the matrix resides in page
0 (locations 0 to 199). Thus, every instruction fetch will be from page 0.
For three page frames, how many page faults are generated by the
following array-initialization loops? Use LRU replacement, and assume


## Practice Exercises
> id: ch10-practice-exercises | src: book Practice Exercises | kind: concept

that page frame 1 contains the process and the other two are initially
empty.
a.
for (int j = 0; j < 100; j++)
for (int i = 0; i < 100; i++)
A[i][j] = 0;
b.
for (int i = 0; i < 100; i++)
for (int j = 0; j < 100; j++)
A[i][j] = 0;


## 10.8 Consider the following page reference string:
> id: ch10-10-8 | src: book 10.8 | kind: concept

1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6, 3, 2, 1, 2, 3, 6.
How many page faults would occur for the following replacement
algorithms, assuming one, two, three, four, five, six, and seven frames?
Remember that all frames are initially empty, so your first unique pages
will cost one fault each.
• LRU replacement
• FIFO replacement
• Optimal replacement


## 10.9 Consider the following page reference string:
> id: ch10-10-9 | src: book 10.9 | kind: concept

7, 2, 3, 1, 2, 5, 3, 4, 6, 7, 7, 1, 0, 5, 4, 6, 2, 3, 0 , 1.
Assuming demand paging with three frames, how many page faults
would occur for the following replacement algorithms?
• LRU replacement
• FIFO replacement
• Optimal replacement
Suppose that you want to use a paging algorithm that requires a ref-
erence bit (such as second-chance replacement or working-set model),
but the hardware does not provide one. Sketch how you could simu-
late a reference bit even if one were not provided by the hardware, or
explain why it is not possible to do so. If it is possible, calculate what
the cost would be.
You have devised a new page-replacement algorithm that you think
may be optimal. In some contorted test cases, Belady’s anomaly occurs.
Is the new algorithm optimal? Explain your answer.
Segmentation is similar to paging but uses variable-sized “pages.”
Define two segment-replacement algorithms, one based on the FIFO
page-replacement scheme and the other on the LRU page-replacement
scheme. Remember that since segments are not the same size, the seg-
ment that is chosen for replacement may be too small to leave enough
Virtual Memory
consecutive locations for the needed segment. Consider strategies for
systems where segments cannot be relocated and strategies for systems
where they can.
Consider a demand-paged computer system where the degree of multi-
programming is currently fixed at four. The system was recently mea-
sured to determine utilization of the CPU and the paging disk. Three
alternative results are shown below. For each case, what is happening?
Can the degree of multiprogramming be increased to increase the CPU
utilization? Is the paging helping?
a.
CPU utilization 13 percent; disk utilization 97 percent
b.
CPU utilization 87 percent; disk utilization 3 percent
c.
CPU utilization 13 percent; disk utilization 3 percent
We have an operating system for a machine that uses base and limit
registers, but we have modified the machine to provide a page table.
Can the page table be set up to simulate base and limit registers? How
can it be, or why can it not be?
Further Reading
The
working-set
model
was
developed
by
[Denning
(1968)].
The
enhanced clock algorithm is discussed by [Carr and Hennessy (1981)].
[Russinovich
et
al.
(2017)]
describe
how
Windows
implements
vir-
tual
memory
and
memory
compression.
Compressed
memory
in
Windows
is
further
discussed
in
http://www.makeuseof.com/
tag/ram-compression-improves-memory-responsiveness-windows-10.
[McDougall and Mauro (2007)] discuss virtual memory in Solaris. Virtual
memory techniques in Linux are described in [Love (2010)] and [Mauerer
(2008)]. FreeBSD is described in [McKusick et al. (2015)].
Bibliography
[Carr and Hennessy (1981)]
W. R. Carr and J. L. Hennessy, “WSClock—A Sim-
ple and Effective Algorithm for Virtual Memory Management”, Proceedings of
the ACM Symposium on Operating Systems Principles (1981), pages 87–95.
[Denning (1968)]
P. J. Denning, “The Working Set Model for Program Behavior”,
Communications of the ACM, Volume 11, Number 5 (1968), pages 323–333.
[Love (2010)]
R. Love, Linux Kernel Development, Third Edition, Developer’s
Library (2010).
[Mauerer (2008)]
W. Mauerer, Professional Linux Kernel Architecture, John Wiley
and Sons (2008).
[McDougall and Mauro (2007)]
R. McDougall and J. Mauro, Solaris Internals,
Second Edition, Prentice Hall (2007).
Bibliography
[McKusick et al. (2015)]
M. K. McKusick, G. V. Neville-Neil, and R. N. M. Wat-
son, The Design and Implementation of the FreeBSD UNIX Operating System–Second
Edition, Pearson (2015).
[Russinovich et al. (2017)]
M. Russinovich, D. A. Solomon, and A. Ionescu, Win-
dows Internals–Part 1, Seventh Edition, Microsoft Press (2017).
Assume that a program has just referenced an address in virtual mem-
ory. Describe a scenario in which each of the following can occur. (If no
such scenario can occur, explain why.)
• TLB miss with no page fault
• TLB miss with page fault
• TLB hit with no page fault
• TLB hit with page fault
Asimplified view of thread states is ready, running, and blocked, where
a thread is either ready and waiting to be scheduled, is running on the
processor, or is blocked (for example, waiting for I/O).
ready
blocked
running
Assuming a thread is in the running state, answer the following ques-
tions, and explain your answers:
a.
Will the thread change state if it incurs a page fault? If so, to what
state will it change?
b.
Will the thread change state if it generates a TLB miss that is
resolved in the page table? If so, to what state will it change?
c.
Will the thread change state if an address reference is resolved in
the page table? If so, to what state will it change?
Consider a system that uses pure demand paging.
a.
When a process first starts execution, how would you characterize
the page-fault rate?
b.
Once the working set for a process is loaded into memory, how
would you characterize the page-fault rate?
c.
Assume that a process changes its locality and the size of the new
working set is too large to be stored in available free memory.
Identify some options system designers could choose from to
handle this situation.
The following is a page table for a system with 12-bit virtual and
physical addresses and 256-byte pages. Free page frames are to be
allocated in the order 9, F, D. A dash for a page frame indicates that
the page is not in memory.
EX-35


## Exercises
> id: ch10-exercises | src: book Exercises | kind: concept

Page
Page Frame
0 x 4
0 x B
0 x A
–
–
0 x 2
–
0 x C
0 x 0
0 x 1
Convert the following virtual addresses to their equivalent physical
addresses in hexadecimal. All numbers are given in hexadecimal. In the
case of a page fault, you must use one of the free frames to update the
page table and resolve the logical address to its corresponding physical
address.
• 0x2A1
• 0x4E6
• 0x94A
• 0x316
What is the copy-on-write feature, and under what circumstances is its
use beneficial? What hardware support is required to implement this
feature?
A certain computer provides its users with a virtual memory space of
232 bytes. The computer has 222 bytes of physical memory. The virtual
memory is implemented by paging, and the page size is 4,096 bytes.
A user process generates the virtual address 11123456. Explain how
the system establishes the corresponding physical location. Distinguish
between software and hardware operations.
Assume that we have a demand-paged memory. The page table is
held in registers. It takes 8 milliseconds to service a page fault if an
empty frame is available or if the replaced page is not modified and 20
milliseconds if the replaced page is modified. Memory-access time is
100 nanoseconds.
Assume that the page to be replaced is modified 70 percent of the
time. What is the maximum acceptable page-fault rate for an effective
access time of no more than 200 nanoseconds?
Consider the page table for a system with 16-bit virtual and physical
addresses and 4,096-byte pages.
EX-36
Page
Page Frame
Reference Bit
–
–
–
The reference bit for a page is set to 1 when the page has been ref-
erenced. Periodically, a thread zeroes out all values of the reference
bit. A dash for a page frame indicates that the page is not in memory.
The page-replacement algorithm is localized LRU, and all numbers are
provided in decimal.
a.
Convert the following virtual addresses (in hexadecimal) to the
equivalent physical addresses. You may provide answers in either
hexadecimal or decimal. Also set the reference bit for the appro-
priate entry in the page table.
• 0x621C
• 0xF0A3
• 0xBC1A
• 0x5BAA
• 0x0BA1
b.
Using the above addresses as a guide, provide an example of a
logical address (in hexadecimal) that results in a page fault.
c.
From what set of page frames will the LRU page-replacement
algorithm choose in resolving a page fault?
When a page fault occurs, the process requesting the page must block
while waiting for the page to be brought from disk into physical mem-
ory. Assume that there exists a process with five user-level threads and
that the mapping of user threads to kernel threads is many to one. If
EX-37


## Exercises
> id: ch10-exercises | src: book Exercises | kind: concept

one user thread incurs a page fault while accessing its stack, would the
other user threads belonging to the same process also be affected by the
page fault—that is, would they also have to wait for the faulting page
to be brought into memory? Explain.
Apply the (1) FIFO, (2) LRU, and (3) optimal (OPT) replacement algo-
rithms for the following page-reference strings:
• 2, 6, 9, 2, 4, 2, 1, 7, 3, 0, 5, 2, 1, 2, 9, 5, 7, 3, 8, 5
• 0, 6, 3, 0, 2, 6, 3, 5, 2, 4, 1, 3, 0, 6, 1, 4, 2, 3, 5, 7
• 3, 1, 4, 2, 5, 4, 1, 3, 5, 2, 0, 1, 1, 0, 2, 3, 4, 5, 0, 1
• 4, 2, 1, 7, 9, 8, 3, 5, 2, 6, 8, 1, 0, 7, 2, 4, 1, 3, 5, 8
• 0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 4, 3, 2, 1, 0
Indicate the number of page faults for each algorithm assuming
demand paging with three frames.
Assume that you are monitoring the rate at which the pointer in the
clock algorithm moves. (The pointer indicates the candidate page for
replacement.) What can you say about the system if you notice the
following behavior:
a.
Pointer is moving fast.
b.
Pointer is moving slow.
Discuss situations in which the least frequently used (LFU) page-
replacement algorithm generates fewer page faults than the least
recently used (LRU) page-replacement algorithm. Also discuss under
what circumstances the opposite holds.
Discuss situations in which the most frequently used (MFU) page-
replacement algorithm generates fewer page faults than the least
recently used (LRU) page-replacement algorithm. Also discuss under
what circumstances the opposite holds.
The KHIE (pronounced “k-hi”) operating system uses a FIFO replace-
ment algorithm for resident pages and a free-frame pool of recently
used pages. Assume that the free-frame pool is managed using the LRU
replacement policy. Answer the following questions:
a.
If a page fault occurs and the page does not exist in the free-frame
pool, how is free space generated for the newly requested page?
b.
If a page fault occurs and the page exists in the free-frame pool,
how are the resident page set and the free-frame pool managed
to make space for the requested page?
c.
To what does the system degenerate if the number of resident
pages is set to one?
d.
To what does the system degenerate if the number of pages in the
free-frame pool is zero?
EX-38
Consider a demand-paging system with the following time-measured
utilizations:
CPU utilization
20%
Paging disk
97.7%
Other I/O devices
5%
For each of the following, indicate whether it will (or is likely to)
improve CPU utilization. Explain your answers.
a.
Install a faster CPU.
b.
Install a bigger paging disk.
c.
Increase the degree of multiprogramming.
d.
Decrease the degree of multiprogramming.
e.
Install more main memory.
f.
Install a faster hard disk or multiple controllers with multiple
hard disks.
g.
Add prepaging to the page-fetch algorithms.
h.
Increase the page size.
Explain why minor page faults take less time to resolve than major page
faults.
Explain why compressed memory is used in operating systems for
mobile devices.
Suppose that a machine provides instructions that can access mem-
ory locations using the one-level indirect addressing scheme. What
sequence of page faults is incurred when all of the pages of a program
are currently nonresident and the first instruction of the program is an
indirect memory-load operation? What happens when the operating
system is using a per-process frame allocation technique and only two
pages are allocated to this process?
Consider the page references:
EX-39


## Exercises
> id: ch10-exercises | src: book Exercises | kind: concept

page numbers
memory address
execution time
(X)
What pages represent the locality at time (X)?
Suppose that your replacement policy (in a paged system) is to examine
each page regularly and to discard that page if it has not been used since
the last examination. What would you gain and what would you lose
by using this policy rather than LRU or second-chance replacement?
A page-replacement algorithm should minimize the number of page
faults. We can achieve this minimization by distributing heavily used
pages evenly over all of memory, rather than having them compete for
a small number of page frames. We can associate with each page frame
a counter of the number of pages associated with that frame. Then,
EX-40
to replace a page, we can search for the page frame with the smallest
counter.
a.
Define a page-replacement algorithm using this basic idea. Specif-
ically address these problems:
• What is the initial value of the counters?
• When are counters increased?
• When are counters decreased?
• How is the page to be replaced selected?
b.
How many page faults occur for your algorithm for the following
reference string with four page frames?
1, 2, 3, 4, 5, 3, 4, 1, 6, 7, 8, 7, 8, 9, 7, 8, 9, 5, 4, 5, 4, 2.
c.
What is the minimum number of page faults for an optimal page-
replacement strategy for the reference string in part b with four
page frames?
Consider a demand-paging system with a paging disk that has an
average access and transfer time of 20 milliseconds. Addresses are
translated through a page table in main memory, with an access time
of 1 microsecond per memory access. Thus, each memory reference
through the page table takes two accesses. To improve this time, we
have added an associative memory that reduces access time to one
memory reference if the page-table entry is in the associative memory.
Assume that 80 percent of the accesses are in the associative memory
and that, of those remaining, 10 percent (or 2 percent of the total) cause
page faults. What is the effective memory access time?
What is the cause of thrashing? How does the system detect thrashing?
Once it detects thrashing, what can the system do to eliminate this
problem?
Is it possible for a process to have two working sets, one representing
data and another representing code? Explain.
Consider the parameter Δ used to define the working-set window in
the working-set model. When Δ is set to a low value, what is the effect
on the page-fault frequency and the number of active (nonsuspended)
processes currently executing in the system? What is the effect when Δ
is set to a very high value?
In a 1,024-KB segment, memory is allocated using the buddy system.
Using Figure 10.26 as a guide, draw a tree illustrating how the following
memory requests are allocated:
• Request 5-KB
• Request 135 KB.
• Request 14 KB.
• Request 3 KB.
EX-41


## Exercises
> id: ch10-exercises | src: book Exercises | kind: concept

• Request 12 KB.
Next, modify the tree for the following releases of memory. Perform
coalescing whenever possible:
• Release 3 KB.
• Release 5 KB.
• Release 14 KB.
• Release 12 KB.
A system provides support for user-level and kernel-level threads. The
mapping in this system is one to one (there is a corresponding kernel
thread for each user thread). Does a multithreaded process consist of
(a) a working set for the entire process or (b) a working set for each
thread? Explain
The slab-allocation algorithm uses a separate cache for each different
object type. Assuming there is one cache per object type, explain why
this scheme doesn’t scale well with multiple CPUs. What could be done
to address this scalability issue?
Consider a system that allocates pages of different sizes to its processes.
What are the advantages of such a paging scheme? What modifica-
tions to the virtual memory system would be needed to provide this
functionality?
EX-42
Programming Problems
Programming Problems
Write a program that implements the FIFO, LRU, and optimal (OPT)
page-replacement algorithms presented in Section 10.4. Have your pro-
gram initially generate a random page-reference string where page
numbers range from 0 to 9. Apply the random page-reference string to
each algorithm, and record the number of page faults incurred by each
algorithm. Pass the number of page frames to the program at startup.
You may implement this program in any programming language of
your choice. (You may find your implementation of either FIFO or LRU
to be helpful in the virtual memory manager programming project.)
Programming Projects
Designing a Virtual Memory Manager
This project consists of writing a program that translates logical to physical
addresses for a virtual address space of size 216 = 65,536 bytes. Your program
will read from a file containing logical addresses and, using a TLB and a page
table, will translate each logical address to its corresponding physical address
and output the value of the byte stored at the translated physical address.
Your learning goal is to use simulation to understand the steps involved in
translating logical to physical addresses. This will include resolving page faults
using demand paging, managing a TLB, and implementing a page-replacement
algorithm.
Specific
Your program will read a file containing several 32-bit integer numbers that
represent logical addresses. However, you need only be concerned with 16-
bit addresses, so you must mask the rightmost 16 bits of each logical address.
These 16 bits are divided into (1) an 8-bit page number and (2) an 8-bit page
offset. Hence, the addresses are structured as shown as:
offset
page
number
Other specifics include the following:
• 28 entries in the page table
• Page size of 28 bytes
• 16 entries in the TLB
• Frame size of 28 bytes
• 256 frames
• Physical memory of 65,536 bytes (256 frames × 256-byte frame size)
P-51
Virtual Memory
Additionally, your program need only be concerned with reading logical
addresses and translating them to their corresponding physical addresses. You
do not need to support writing to the logical address space.
Address Translation
Your program will translate logical to physical addresses using a TLB and page
table as outlined in Section 9.3. First, the page number is extracted from the
logical address, and the TLB is consulted. In the case of a TLB hit, the frame
number is obtained from the TLB. In the case of a TLB miss, the page table
must be consulted. In the latter case, either the frame number is obtained from
the page table, or a page fault occurs. A visual representation of the address-
translation process is:
page
number
TLB
page
table
TLB hit
TLB miss
page 0
page 255
page 1
page 2
frame
number
....
....
physical
memory
frame 0
frame 255
frame 1
frame 2
....
page
number
offset
frame
number
offset
Handling Page Faults
Your program will implement demand paging as described in Section 10.2. The
backing store is represented by the file BACKING STORE.bin, a binary file of
size 65,536 bytes. When a page fault occurs, you will read in a 256-byte page
from the file BACKING STORE and store it in an available page frame in physical
memory. For example, if a logical address with page number 15 resulted in a
page fault, your program would read in page 15 from BACKING STORE (remem-
ber that pages begin at 0 and are 256 bytes in size) and store it in a page frame
in physical memory. Once this frame is stored (and the page table and TLB are
updated), subsequent accesses to page 15 will be resolved by either the TLB or
the page table.
P-52
Programming Projects
You will need to treat BACKING STORE.bin as a random-access file so that
you can randomly seek to certain positions of the file for reading. We suggest
using the standard C library functions for performing I/O, including fopen(),
fread(), fseek(), and fclose().
The size of physical memory is the same as the size of the virtual address
space—65,536 bytes—so you do not need to be concerned about page replace-
ments during a page fault. Later, we describe a modification to this project
using a smaller amount of physical memory; at that point, a page-replacement
strategy will be required.
Test File
We provide the file addresses.txt, which contains integer values represent-
ing logical addresses ranging from 0to65535 (the size of the virtual address
space). Your program will open this file, read each logical address and translate
it to its corresponding physical address, and output the value of the signed byte
at the physical address.
How to Begin
First, write a simple program that extracts the page number and offset based
on:
offset
page
number
from the following integer numbers:
1, 256, 32768, 32769, 128, 65534, 33153
Perhaps the easiest way to do this is by using the operators for bit-masking and
bit-shifting. Once you can correctly establish the page number and offset from
an integer number, you are ready to begin.
Initially, we suggest that you bypass the TLB and use only a page table. You
can integrate the TLB once your page table is working properly. Remember,
address translation can work without a TLB; the TLB just makes it faster. When
you are ready to implement the TLB, recall that it has only sixteen entries, so
you will need to use a replacement strategy when you update a full TLB. You
may use either a FIFO or an LRU policy for updating your TLB.
How to Run Your Program
Your program should run as follows:
./a.out addresses.txt
Your program will read in the file addresses.txt, which contains 1,000 logical
addresses ranging from 0 to 65535. Your program is to translate each logical
address to a physical address and determine the contents of the signed byte
stored at the correct physical address. (Recall that in the C language, the char
data type occupies a byte of storage, so we suggest using char values.)
P-53
Virtual Memory
Your program is to output the following values:
1. The logical address being translated (the integer value being read from
addresses.txt).
2. The corresponding physical address (what your program translates the
logical address to).
3. The signed byte value stored in physical memory at the translated phys-
ical address.
We also provide the file correct.txt, which contains the correct output
values for the file addresses.txt. You should use this file to determine if your
program is correctly translating logical to physical addresses.
Statistics
After completion, your program is to report the following statistics:
1. Page-fault rate—The percentage of address references that resulted in
page faults.
2.
TLB hit rate—The percentage of address references that were resolved in
the TLB.
Since the logical addresses in addresses.txt were generated randomly and
do not reflect any memory access locality, do not expect to have a high TLB hit
rate.
Page Replacement
Thus far, this project has assumed that physical memory is the same size as the
virtual address space. In practice, physical memory is typically much smaller
than a virtual address space. This phase of the project now assumes using
a smaller physical address space with 128 page frames rather than 256. This
change will require modifying your program so that it keeps track of free page
frames as well as implementing a page-replacement policy using either FIFO or
LRU (Section 10.4) to resolve page faults when there is no free memory.
P-54

