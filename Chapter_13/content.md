---
doc_type: scientific_content
course_id: operating_systems
chapter: 13
chapter_id: operating_systems_ch13
chapter_title: Chapter 13
textbook: "Operating System Concepts (Silberschatz, Galvin, Gagne)"
textbook_edition: "10th"
language: en
syllabus_applied: false
sources:
  - {role: book, file: "Abraham-Silberschatz-Operating-System-Concepts-10th-2018-659-693.pdf", pages: "TBD"}
  - {role: slides, file: "ch13.pptx", slides: "1-40"}
assets_dir: assets
asset_counts: {"table_image": 2, "text_table": 0, "illustration": 13, "equation": 0, "graph": 0, "picture": 2, "code_image": 0, "text_image": 0, "total": 17}
spec_version: "1.0"
generated_at: "2026-09-30T00:00:00Z"
status: complete
---

# Chapter 13

> id: ch13-intro | src: book introduction; slides 1-3 | kind: concept

C H A P T E R
File-System
Interface
For most users, the file system is the most visible aspect of a general-purpose
operating system. It provides the mechanism for on-line storage of and access
to both data and programs of the operating system and all the users of the
computer system. The file system consists of two distinct parts: a collection of
files, each storing related data, and a directory structure, which organizes and
provides information about all the files in the system. Most file systems live on
storage devices, which we described in Chapter 11 and will continue to discuss
in the next chapter. In this chapter, we consider the various aspects of files and
the major directory structures. We also discuss the semantics of sharing files
among multiple processes, users, and computers. Finally, we discuss ways to
handle file protection, necessary when we have multiple users and want to
control who may access files and how files may be accessed.
CHAPTER OBJECTIVES
• Explain the function of file systems.
• Describe the interfaces to file systems.
• Discuss file-system design tradeoffs, including access methods, file shar-
ing, file locking, and directory structures.
• Explore file-system protection.


**Chapter 13:  File-System Interface**



**Outline**

- File Concept
- Access Methods
- Disk and Directory Structure
- Protection
- Memory-Mapped Files


**Objectives**

- To explain the function of file systems
- To describe the interfaces to file systems
- To discuss file-system design tradeoffs, including access methods, file sharing, file locking, and directory structures
- To explore file-system protection


## 13.1 File Concept
> id: ch13-13-1 | src: book 13.1; slides 4-23 | kind: concept

Computers can store information on various storage media, such as NVM
devices, HDDs, magnetic tapes, and optical disks. So that the computer system
will be convenient to use, the operating system provides a uniform logical
view of stored information. The operating system abstracts from the physical
properties of its storage devices to define a logical storage unit, the fil . Files are
mapped by the operating system onto physical devices. These storage devices
are usually nonvolatile, so the contents are persistent between system reboots.
File-System Interface
A file is a named collection of related information that is recorded on sec-
ondary storage. From a user’s perspective, a file is the smallest allotment of
logical secondary storage; that is, data cannot be written to secondary storage
unless they are within a file. Commonly, files represent programs (both source
and object forms) and data. Data files may be numeric, alphabetic, alphanu-
meric, or binary. Files may be free form, such as text files, or may be formatted
rigidly. In general, a file is a sequence of bits, bytes, lines, or records, the mean-
ing of which is defined by the file’s creator and user. The concept of a file is
thus extremely general.
Because files are the method users and applications use to store and
retrieve data, and because they are so general purpose, their use has stretched
beyond its original confines. For example, UNIX, Linux, and some other oper-
ating systems provide a proc file system that uses file-system interfaces to
provide access to system information (such as process details).
The information in a file is defined by its creator. Many different types of
information may be stored in a file—source or executable programs, numeric
or text data, photos, music, video, and so on. A file has a certain defined struc-
ture, which depends on its type. Atext fil is a sequence of characters organized
into lines (and possibly pages). A source fil is a sequence of functions, each of
which is further organized as declarations followed by executable statements.
An executable fil is a series of code sections that the loader can bring into
memory and execute.
File Attributes
A file is named, for the convenience of its human users, and is referred to by
its name. A name is usually a string of characters, such as example.c. Some
systems differentiate between uppercase and lowercase characters in names,
whereas other systems do not. When a file is named, it becomes independent
of the process, the user, and even the system that created it. For instance, one
user might create the file example.c, and another user might edit that file
by specifying its name. The file’s owner might write the file to a USB drive,
send it as an e-mail attachment, or copy it across a network, and it could still
be called example.c on the destination system. Unless there is a sharing and
synchonization method, that second copy is now independent of the first and
can be changed separately.
A file’s attributes vary from one operating system to another but typically
consist of these:
• Name. The symbolic file name is the only information kept in human-
readable form.
• Identifie . This unique tag, usually a number, identifies the file within the
file system; it is the non-human-readable name for the file.
• Type. This information is needed for systems that support different types
of files.
• Location. This information is a pointer to a device and to the location of
the file on that device.


- Contiguous logical address space
- Types:
  - Data
    - Numeric
    - Character
    - Binary
  - Program
- Contents defined by file’s creator
  - Many types
    - text file,
    - source file,
    - executable file


**File Attributes**

- Name – only information kept in human-readable form
- Identifier – unique tag (number) identifies file within file system
- Type – needed for systems that support different types
- Location – pointer to file location on device
- Size – current file size
- Protection – controls who can do reading, writing, executing
- Time, date, and user identification – data for protection, security, and usage monitoring
- Information about files are kept in the directory structure, which is maintained on the disk
- Many variations, including extended file attributes such as file checksum
- Information kept in the directory structure


**File info Window on Mac OS X**



> **[ASSET ch13_ill_001]** Figure from slide 6
> - type: illustration
> - kind: other
> - file: assets/ch13_slide06_img001.jpg
> - src: slides 6
> - shows: Illustration from slide 6
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

- Disk Structure
- Disk can be subdivided into partitions
- Disks or partitions can be RAID protected against failure
- Disk or partition can be used raw – without a file system, or formatted with a file system
- Partitions also known as minidisks, slices
- Entity containing file system is known as a volume
- Each volume containing a file system also tracks that file system’s info in device directory or volume table of contents
- In addition to general-purpose file systems there are many special-purpose file systems, frequently all within the same operating system or computer


**A Typical File-system Organization**



> **[ASSET ch13_ill_002]** Figure from slide 22
> - type: illustration
> - kind: other
> - file: assets/ch13_slide22_img006.jpg
> - src: slides 22
> - shows: Illustration from slide 22
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

- Types of File Systems
- We mostly talk of general-purpose file systems
- But systems frequently have may file systems, some general- and some special- purpose
- Consider Solaris has
  - tmpfs – memory-based volatile FS for fast, temporary I/O
  - objfs – interface into kernel memory to get kernel symbols for debugging
  - ctfs – contract file system for managing daemons
  - lofs – loopback file system allows one FS to be accessed in place of another
  - procfs – kernel interface to process structures
  - ufs, zfs – general purpose file systems


## 13.1 File Concept
> id: ch13-13-1 | src: book 13.1 | kind: concept

• Size. The current size of the file (in bytes, words, or blocks) and possibly
the maximum allowed size are included in this attribute.
• Protection. Access-control information determines who can do reading,
writing, executing, and so on.
• Timestamps and user identificatio . This information may be kept for
creation, last modification, and last use. These data can be useful for pro-
tection, security, and usage monitoring.
Some newer file systems also support extended file attributes, including char-
acter encoding of the file and security features such as a file checksum. Figure


## 13.1 illustrates a fil info window on macOS that displays a file’s attributes.
> id: ch13-13-1 | src: book 13.1 | kind: concept

The information about all files is kept in the directory structure, which
resides on the same device as the files themselves. Typically, a directory entry
consists of the file’s name and its unique identifier. The identifier in turn
locates the other file attributes. It may take more than a kilobyte to record
this information for each file. In a system with many files, the size of the
directory itself may be megabytes or gigabytes. Because directories must match
the volatility of the files, like files, they must be stored on the device and are
usually brought into memory piecemeal, as needed.
Figure 13.1
A file info window on macOS.
File-System Interface
File Operations
A file is an abstract data type. To define a file properly, we need to consider the
operations that can be performed on files. The operating system can provide
system calls to create, write, read, reposition, delete, and truncate files. Let’s
examine what the operating system must do to perform each of these seven
basic file operations. It should then be easy to see how other similar operations,
such as renaming a file, can be implemented.
• Creating a fil . Two steps are necessary to create a file. First, space in the
file system must be found for the file. We discuss how to allocate space for
the file in Chapter 14. Second, an entry for the new file must be made in a
directory.
• Opening a fil . Rather than have all file operations specify a file name,
causing the operating system to evaluate the name, check access permis-
sions, and so on, all operations except create and delete require a file
open() first. If successful, the open call returns a file handle that is used as
an argument in the other calls.
• Writing a fil . To write a file, we make a system call specifying both the
open file handle and the information to be written to the file. The system
must keep a write pointer to the location in the file where the next write
is to take place if it is sequential. The write pointer must be updated
whenever a write occurs.
• Reading a fil . To read from a file, we use a system call that specifies the
file handle and where (in memory) the next block of the file should be
put. Again, the system needs to keep a read pointer to the location in
the file where the next read is to take place, if sequential. Once the read
has taken place, the read pointer is updated. Because a process is usually
either reading from or writing to a file, the current operation location can
be kept as a per-process current-file-positio
pointer. Both the read and
write operations use this same pointer, saving space and reducing system
complexity.
• Repositioning within a file. The current-file-position pointer of the open
file is repositioned to a given value. Repositioning within a file need not
involve any actual I/O. This file operation is also known as a file seek.
• Deleting a fil . To delete a file, we search the directory for the named file.
Having found the associated directory entry, we release all file space, so
that it can be reused by other files, and erase or mark as free the directory
entry. Note that some systems allow hard links—multiple names (direc-
tory entries) for the same file. In this case the actual file contents is not
deleted until the last link is deleted.
• Truncating a fil . The user may want to erase the contents of a file but
keep its attributes. Rather than forcing the user to delete the file and then
recreate it, this function allows all attributes to remain unchanged—except
for file length. The file can then be reset to length zero, and its file space
can be released.


## 13.1 File Concept
> id: ch13-13-1 | src: book 13.1 | kind: concept

These seven basic operations comprise the minimal set of required file
operations. Other common operations include appending new information
to the end of an existing file and renaming an existing file. These primitive
operations can then be combined to perform other file operations. For instance,
we can create a copy of a file by creating a new file and then reading from the
old and writing to the new. We also want to have operations that allow a user
to get and set the various attributes of a file. For example, we may want to have
operations that allow a user to determine the status of a file, such as the file’s
length, and to set file attributes, such as the file’s owner.
As mentioned, most of the file operations mentioned involve searching the
directory for the entry associated with the named file. To avoid this constant
searching, many systems require that an open() system call be made before a
file is first used. The operating system keeps a table, called the open-fil table,
containing information about all open files. When a file operation is requested,
the file is specified via an index into this table, so no searching is required.
When the file is no longer being actively used, it is closed by the process, and
the operating system removes its entry from the open-file table, potentially
releasing locks. create() and delete() are system calls that work with closed
rather than open files.
Some systems implicitly open a file when the first reference to it is made.
The file is automatically closed when the job or program that opened the
file terminates. Most systems, however, require that the programmer open a
file explicitly with the open() system call before that file can be used. The
open() operation takes a file name and searches the directory, copying the
directory entry into the open-file table. The open() call can also accept access-
mode information—create, read-only, read–write, append-only, and so on.
This mode is checked against the file’s permissions. If the request mode is
allowed, the file is opened for the process. The open() system call typically
returns a pointer to the entry in the open-file table. This pointer, not the actual
file name, is used in all I/O operations, avoiding any further searching and
simplifying the system-call interface.
The implementation of the open() and close() operations is more com-
plicated in an environment where several processes may open the file simulta-
neously. This may occur in a system where several different applications open
the same file at the same time. Typically, the operating system uses two levels
of internal tables: a per-process table and a system-wide table. The per-process
table tracks all files that a process has open. Stored in this table is information
regarding the process’s use of the file. For instance, the current file pointer for
each file is found here. Access rights to the file and accounting information can
also be included.
Each entry in the per-process table in turn points to a system-wide open-file
table. The system-wide table contains process-independent information, such
as the location of the file on disk, access dates, and file size. Once a file has been
opened by one process, the system-wide table includes an entry for the file.
When another process executes an open() call, a new entry is simply added
to the process’s open-file table pointing to the appropriate entry in the system-
wide table. Typically, the open-file table also has an open count associated with
each file to indicate how many processes have the file open. Each close()
decreases this open count, and when the open count reaches zero, the file is no
longer in use, and the file’s entry is removed from the open-file table.
File-System Interface
FILE LOCKING IN JAVA
In the Java API, acquiring a lock requires first obtaining the FileChannel
for the file to be locked. The lock() method of the FileChannel is used to
acquire the lock. The API of the lock() method is
FileLock lock(long begin, long end, boolean shared)
where begin and end are the beginning and ending positions of the region
being locked. Setting shared to true is for shared locks; setting shared
to false acquires the lock exclusively. The lock is released by invoking the
release() of the FileLock returned by the lock() operation.
The program in Figure 13.2 illustrates file locking in Java. This program
acquires two locks on the file file.txt. The lock for the first half of the file
is an exclusive lock; the lock for the second half is a shared lock.
In summary, several pieces of information are associated with an open file.
• File pointer. On systems that do not include a file offset as part of the
read() and write() system calls, the system must track the last read–
write location as a current-file-position pointer. This pointer is unique to
each process operating on the file and therefore must be kept separate from
the on-disk file attributes.
• File-open count. As files are closed, the operating system must reuse its
open-file table entries, or it could run out of space in the table. Multiple
processes may have opened a file, and the system must wait for the last
file to close before removing the open-file table entry. The file-open count
tracks the number of opens and closes and reaches zero on the last close.
The system can then remove the entry.
• Location of the fil . Most file operations require the system to read or write
data within the file. The information needed to locate the file (wherever it
is located, be it on mass storage, on a file server across the network, or on
a RAM drive) is kept in memory so that the system does not have to read it
from the directory structure for each operation.
• Access rights. Each process opens a file in an access mode. This informa-
tion is stored on the per-process table so the operating system can allow or
deny subsequent I/O requests.
Some operating systems provide facilities for locking an open file (or sec-
tions of a file). File locks allow one process to lock a file and prevent other
processes from gaining access to it. File locks are useful for files that are shared
by several processes—for example, a system log file that can be accessed and
modified by a number of processes in the system.
File locks provide functionality similar to reader–writer locks, covered in
Section 7.1.2. Ashared lock is akin to a reader lock in that several processes can
acquire the lock concurrently. An exclusive lock behaves like a writer lock; only
one process at a time can acquire such a lock. It is important to note that not


## 13.1 File Concept
> id: ch13-13-1 | src: book 13.1 | kind: concept

import java.io.*;
import java.nio.channels.*;
public class LockingExample {
public static final boolean EXCLUSIVE = false;
public static final boolean SHARED = true;
public static void main(String args[]) throws IOException {
FileLock sharedLock = null;
FileLock exclusiveLock = null;
try {
RandomAccessFile raf = new RandomAccessFile("file.txt","rw");
// get the channel for the file
FileChannel ch = raf.getChannel();
// this locks the first half of the file - exclusive
exclusiveLock = ch.lock(0, raf.length()/2, EXCLUSIVE);
/** Now modify the data . . . */
// release the lock
exclusiveLock.release();
// this locks the second half of the file - shared
sharedLock = ch.lock(raf.length()/2+1,raf.length(),SHARED);
/** Now read the data . . . */
// release the lock
sharedLock.release();
} catch (java.io.IOException ioe) {
System.err.println(ioe);
}
finally {
if (exclusiveLock != null)
exclusiveLock.release();
if (sharedLock != null)
sharedLock.release();
}
}
}
Figure 13.2
File-locking example in Java.
all operating systems provide both types of locks: some systems provide only
exclusive file locking.
Furthermore, operating systems may provide either mandatory or advi-
sory file-locking mechanisms. With mandatory locking, once a process acquires
an exclusive lock, the operating system will prevent any other process from
File-System Interface
accessing the locked file. For example, assume a process acquires an exclusive
lock on the file system.log. If we attempt to open system.log from another
process—for example, a text editor—the operating system will prevent access
until the exclusive lock is released. Alternatively, if the lock is advisory, then the
operating system will not prevent the text editor from acquiring access to sys-
tem.log. Rather, the text editor must be written so that it manually acquires the
lock before accessing the file. In other words, if the locking scheme is manda-
tory, the operating system ensures locking integrity. For advisory locking, it
is up to software developers to ensure that locks are appropriately acquired
and released. As a general rule, Windows operating systems adopt mandatory
locking, and UNIX systems employ advisory locks.
The use of file locks requires the same precautions as ordinary process syn-
chronization. For example, programmers developing on systems with manda-
tory locking must be careful to hold exclusive file locks only while they are
accessing the file. Otherwise, they will prevent other processes from accessing
the file as well. Furthermore, some measures must be taken to ensure that two
or more processes do not become involved in a deadlock while trying to acquire
file locks.
File Types
When we design a file system—indeed, an entire operating system—we
always consider whether the operating system should recognize and support
file types. If an operating system recognizes the type of a file, it can then operate
on the file in reasonable ways. For example, a common mistake occurs when a
user tries to output the binary-object form of a program. This attempt normally
produces garbage; however, the attempt can succeed if the operating system
has been told that the file is a binary-object program.
A common technique for implementing file types is to include the type
as part of the file name. The name is split into two parts—a name and an
extension, usually separated by a period (Figure 13.3). In this way, the user
and the operating system can tell from the name alone what the type of a file
is. Most operating systems allow users to specify a file name as a sequence
of characters followed by a period and terminated by an extension made
up of additional characters. Examples include resume.docx, server.c, and
ReaderThread.cpp.
The system uses the extension to indicate the type of the file and the type
of operations that can be done on that file. Only a file with a .com, .exe, or .sh
extension can be executed, for instance. The .com and .exe files are two forms
of binary executable files, whereas the .sh file is a shell script containing, in
ASCII format, commands to the operating system. Application programs also
use extensions to indicate file types in which they are interested. For example,
Java compilers expect source files to have a .java extension, and the Microsoft
Word word processor expects its files to end with a .doc or .docx extension.
These extensions are not always required, so a user may specify a file without
the extension (to save typing), and the application will look for a file with
the given name and the extension it expects. Because these extensions are
not supported by the operating system, they can be considered “hints” to the
applications that operate on them.
Consider, too, the macOS operating system. In this system, each file has
a type, such as .app (for application). Each file also has a creator attribute


## 13.1 File Concept
> id: ch13-13-1 | src: book 13.1 | kind: concept

file type
usual extension
function
ready-to-run machine-
language program
executable
exe, com, bin
or none
compiled, machine
language, not linked
object
obj, o
binary file containing
audio or A/V information
multimedia
mpeg, mov, mp3,
mp4, avi
related files grouped into
one file, sometimes com-
pressed, for archiving
or storage
archive
rar, zip, tar
ASCII or binary file in a
format for printing or
viewing
print or view
gif, pdf, jpg
libraries of routines for
programmers
library
lib, a, so, dll
various word-processor
formats
word processor
docx
commands to the command
interpreter
batch
bat, sh
textual data, documents
markup
xml, html, tex
source code in various
languages
source code
c, cc, java, perl,
asm
xml, rtf,
Figure 13.3
Common file types.
containing the name of the program that created it. This attribute is set by
the operating system during the create() call, so its use is enforced and
supported by the system. For instance, a file produced by a word processor
has the word processor’s name as its creator. When the user opens that file, by
double-clicking the mouse on the icon representing the file, the word processor
is invoked automatically, and the file is loaded, ready to be edited.
The UNIX system uses a magic number stored at the beginning of some
binary files to indicate the type of data in the file (for example, the format
of an image file). Likewise, it uses a text magic number at the start of text
files to indicate the type of file (which shell language a script is written in)
and so on. (For more details on magic numbers and other computer jargon,
see http://www.catb.org/esr/jargon/.) Not all files have magic numbers, so
system features cannot be based solely on this information. UNIX does not
record the name of the creating program, either. UNIX does allow file-name-
extension hints, but these extensions are neither enforced nor depended on by
the operating system; they are meant mostly to aid users in determining what
type of contents the file contains. Extensions can be used or ignored by a given
application, but that is up to the application’s programmer.
File Structure
File types also can be used to indicate the internal structure of the file. Source
and object files have structures that match the expectations of the programs
that read them. Further, certain files must conform to a required structure that
File-System Interface
is understood by the operating system. For example, the operating system
requires that an executable file have a specific structure so that it can determine
where in memory to load the file and what the location of the first instruction
is. Some operating systems extend this idea into a set of system-supported
file structures, with sets of special operations for manipulating files with those
structures.
This point brings us to one of the disadvantages of having the operating
system support multiple file structures: it makes the operating system large
and cumbersome. If the operating system defines five different file structures, it
needs to contain the code to support these file structures. In addition, it may be
necessary to define every file as one of the file types supported by the operating
system. When new applications require information structured in ways not
supported by the operating system, severe problems may result.
For example, assume that a system supports two types of files: text files
(composed of ASCII characters separated by a carriage return and line feed)
and executable binary files. Now, if we (as users) want to define an encrypted
file to protect the contents from being read by unauthorized people, we may
find neither file type to be appropriate. The encrypted file is not ASCII text lines
but rather is (apparently) random bits. Although it may appear to be a binary
file, it is not executable. As a result, we may have to circumvent or misuse the
operating system’s file-type mechanism or abandon our encryption scheme.
Some operating systems impose (and support) a minimal number of file
structures. This approach has been adopted in UNIX, Windows, and others.
UNIX considers each file to be a sequence of 8-bit bytes; no interpretation of
these bits is made by the operating system. This scheme provides maximum
flexibility but little support. Each application program must include its own
code to interpret an input file as to the appropriate structure. However, all
operating systems must support at least one structure—that of an executable
file—so that the system is able to load and run programs.
Internal File Structure
Internally, locating an offset within a file can be complicated for the operating
system. Disk systems typically have a well-defined block size determined by
the size of a sector. All disk I/O is performed in units of one block (physical
record), and all blocks are the same size. It is unlikely that the physical record
size will exactly match the length of the desired logical record. Logical records
may even vary in length. Packing a number of logical records into physical
blocks is a common solution to this problem.
For example, the UNIX operating system defines all files to be simply
streams of bytes. Each byte is individually addressable by its offset from the
beginning (or end) of the file. In this case, the logical record size is 1 byte. The
file system automatically packs and unpacks bytes into physical disk blocks—
say, 512 bytes per block—as necessary.
The logical record size, physical block size, and packing technique deter-
mine how many logical records are in each physical block. The packing can be
done either by the user’s application program or by the operating system. In
either case, the file may be considered a sequence of blocks. All the basic I/O
functions operate in terms of blocks. The conversion from logical records to
physical blocks is a relatively simple software problem.


## 13.2 Access Methods
> id: ch13-13-2 | src: book 13.2; slides 15-20 | kind: concept

Because disk space is always allocated in blocks, some portion of the last
block of each file is generally wasted. If each block were 512 bytes, for example,
then a file of 1,949 bytes would be allocated four blocks (2,048 bytes); the last
99 bytes would be wasted. The waste incurred to keep everything in units
of blocks (instead of bytes) is internal fragmentation. All file systems suffer
from internal fragmentation; the larger the block size, the greater the internal
fragmentation.


- A file is fixed length logical records
- Sequential Access
- Direct Access
- Other Access Methods


**Sequential Access**

- Operations
  - read next
  - write next
  - Reset
  - no read after last write  (rewrite)
- Figure


> **[ASSET ch13_ill_003]** Figure from slide 16
> - type: illustration
> - kind: other
> - file: assets/ch13_slide16_img003.png
> - src: slides 16
> - shows: Illustration from slide 16
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Direct Access**

- Operations
  - read n
  - write n
  - position to n
    - read next
    - write next
    - rewrite n
- n = relative block number
- Relative block numbers allow OS to decide where file should be placed


**Simulation of Sequential Access on Direct-access File**



> **[ASSET ch13_ill_004]** Figure from slide 18
> - type: illustration
> - kind: other
> - file: assets/ch13_slide18_img004.png
> - src: slides 18
> - shows: Illustration from slide 18
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Other Access Methods**

- Can be other access methods built on top of base methods
- General involve creation of an index for the file
- Keep index in memory for fast determination of location of data to be operated on (consider Universal Produce Code (UPC code) plus record of data about that item)
- If the index is too large, create an in-memory index, which an index of a disk index
- IBM indexed sequential-access method (ISAM)
  - Small master index, points to disk blocks of secondary index
  - File kept sorted on a defined key
  - All done by the OS
- VMS operating system provides index and relative files as another example (see next slide)


**Example of Index and Relative Files**



> **[ASSET ch13_ill_005]** Figure from slide 20
> - type: illustration
> - kind: other
> - file: assets/ch13_slide20_img005.png
> - src: slides 20
> - shows: Illustration from slide 20
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 13.2 Access Methods
> id: ch13-13-2 | src: book 13.2 | kind: concept

Files store information. When it is used, this information must be accessed and
read into computer memory. The information in the file can be accessed in
several ways. Some systems provide only one access method for files. Others
(such as mainframe operating systems) support many access methods, and
choosing the right one for a particular application is a major design problem.
Sequential Access
The simplest access method is sequential access. Information in the file is
processed in order, one record after the other. This mode of access is by far
the most common; for example, editors and compilers usually access files in
this fashion.
Reads and writes make up the bulk of the operations on a file. A read
operation—read next()—reads the next portion of the file and automatically
advances a file pointer, which tracks the I/O location. Similarly, the write
operation—write next()—appends to the end of the file and advances to the
end of the newly written material (the new end of file). Such a file can be reset
to the beginning, and on some systems, a program may be able to skip forward
or backward n records for some integer n—perhaps only for n = 1. Sequential
access, which is depicted in Figure 13.4, is based on a tape model of a file and
works as well on sequential-access devices as it does on random-access ones.
Direct Access
Another method is direct access (or relative access). Here, a file is made up
of fixed-length logical records that allow programs to read and write records
rapidly in no particular order. The direct-access method is based on a disk
model of a file, since disks allow random access to any file block. For direct
access, the file is viewed as a numbered sequence of blocks or records. Thus,
beginning
end
current position
rewind
read or write
Figure 13.4
Sequential-access file.
File-System Interface
we may read block 14, then read block 53, and then write block 7. There are no
restrictions on the order of reading or writing for a direct-access file.
Direct-access files are of great use for immediate access to large amounts
of information. Databases are often of this type. When a query concerning a
particular subject arrives, we compute which block contains the answer and
then read that block directly to provide the desired information.
As a simple example, on an airline-reservation system, we might store all
the information about a particular flight (for example, flight 713) in the block
identified by the flight number. Thus, the number of available seats for flight
713 is stored in block 713 of the reservation file. To store information about a
larger set, such as people, we might compute a hash function on the people’s
names or search a small in-memory index to determine a block to read and
search.
For the direct-access method, the file operations must be modified to
include the block number as a parameter. Thus, we have read(n), where
n is the block number, rather than read next(), and write(n) rather
than write next(). An alternative approach is to retain read next() and
write next() and to add an operation position file(n) where n is the
block number. Then, to effect a read(n), we would position file(n) and
then read next().
The block number provided by the user to the operating system is normally
a relative block number. A relative block number is an index relative to the
beginning of the file. Thus, the first relative block of the file is 0, the next is
1, and so on, even though the absolute disk address may be 14703 for the
first block and 3192 for the second. The use of relative block numbers allows
the operating system to decide where the file should be placed (called the
allocation problem, as we discuss in Chapter 14) and helps to prevent the user
from accessing portions of the file system that may not be part of her file. Some
systems start their relative block numbers at 0; others start at 1.
How, then, does the system satisfy a request for record N in a file? Assum-
ing we have a logical record length L, the request for record N is turned into
an I/O request for L bytes starting at location L ∗(N) within the file (assuming
the first record is N = 0). Since logical records are of a fixed size, it is also easy
to read, write, or delete a record.
Not all operating systems support both sequential and direct access for
files. Some systems allow only sequential file access; others allow only direct
access. Some systems require that a file be defined as sequential or direct when
it is created. Such a file can be accessed only in a manner consistent with its
declaration. We can easily simulate sequential access on a direct-access file by
simply keeping a variable cp that defines our current position, as shown in
Figure 13.5. Simulating a direct-access file on a sequential-access file, however,
is extremely inefficient and clumsy.
Other Access Methods
Other access methods can be built on top of a direct-access method. These
methods generally involve the construction of an index for the file. The index,
like an index in the back of a book, contains pointers to the various blocks. To
find a record in the file, we first search the index and then use the pointer to
access the file directly and to find the desired record.


## 13.3 Directory Structure
> id: ch13-13-3 | src: book 13.3; slides 7-34 | kind: concept

sequential access
reset
read_next
write_next
cp
0;
read cp;
cp
cp
1;
write cp;
cp
cp
1;
implementation for direct access
Figure 13.5
Simulation of sequential access on a direct-access file.
For example, a retail-price file might list the universal product codes (UPCs)
for items, with the associated prices. Each record consists of a 10-digit UPC and
a 6-digit price, for a 16-byte record. If our disk has 1,024 bytes per block, we
can store 64 records per block. A file of 120,000 records would occupy about
2,000 blocks (2 million bytes). By keeping the file sorted by UPC, we can define
an index consisting of the first UPC in each block. This index would have 2,000
entries of 10 digits each, or 20,000 bytes, and thus could be kept in memory. To
find the price of a particular item, we can make a binary search of the index.
From this search, we learn exactly which block contains the desired record and
access that block. This structure allows us to search a large file doing little I/O.
With large files, the index file itself may become too large to be kept in
memory. One solution is to create an index for the index file. The primary index
file contains pointers to secondary index files, which point to the actual data
items.
For example, IBM’s indexed sequential-access method (ISAM) uses a small
master index that points to disk blocks of a secondary index. The secondary
index blocks point to the actual file blocks. The file is kept sorted on a defined
key. To find a particular item, we first make a binary search of the master index,
which provides the block number of the secondary index. This block is read
in, and again a binary search is used to find the block containing the desired
record. Finally, this block is searched sequentially. In this way, any record can
be located from its key by at most two direct-access reads. Figure 13.6 shows a
similar situation as implemented by OpenVMS index and relative files.


- A collection of nodes containing information about all files
- Both the directory structure and the files reside on disk


**File Operations**

- Create
- Write – at write pointer location
- Read – at read pointer location
- Reposition within file - seek
- Delete
- Truncate
- Open (Fi) – search the directory structure on disk for entry Fi, and move the content of entry to memory
- Close (Fi) – move the content of entry Fi in memory to directory structure on disk


**Open Files**

- Several pieces of data are needed to manage open files:
  - Open-file table: tracks open files
  - File pointer:  pointer to last read/write location, per process that has the file open
  - File-open count: counter of number of times a file is open – to allow removal of data from open-file table when last processes closes it
  - Disk location of the file: cache of data access information
  - Access rights: per-process access mode information


**File Locking**

- Provided by some operating systems and file systems
  - Similar to reader-writer locks
  - Shared lock similar to reader lock – several processes can acquire concurrently
  - Exclusive lock similar to writer lock
- Mediates access to a file
- Mandatory or advisory:
  - Mandatory – access is denied depending on locks held and requested
  - Advisory – processes can find status of locks and decide what to do


**File Locking Example – Java API**

- import java.io.*;
- import java.nio.channels.*;
- public class LockingExample {
- public static final boolean EXCLUSIVE = false;
- public static final boolean SHARED = true;
- public static void main(String arsg[]) throws IOException {
- FileLock sharedLock = null;
- FileLock exclusiveLock = null;
- try {
- RandomAccessFile raf = new RandomAccessFile("file.txt", "rw");
- // get the channel for the file
- FileChannel ch = raf.getChannel();
- // this locks the first half of the file - exclusive
- exclusiveLock = ch.lock(0, raf.length()/2, EXCLUSIVE);
- /** Now modify the data . . . */
- // release the lock
- exclusiveLock.release();


**File Locking Example – Java API (Cont.)**

- // this locks the second half of the file - shared
- sharedLock = ch.lock(raf.length()/2+1, raf.length(), 				SHARED);
- /** Now read the data . . . */
- // release the lock
- sharedLock.release();
- } catch (java.io.IOException ioe) {
- System.err.println(ioe);
- }finally {
- if (exclusiveLock != null)
- exclusiveLock.release();
- if (sharedLock != null)
- sharedLock.release();
- }
- }
- }


**File Types – Name, Extension**



> **[ASSET ch13_ill_006]** Figure from slide 13
> - type: illustration
> - kind: other
> - file: assets/ch13_slide13_img002.png
> - src: slides 13
> - shows: Illustration from slide 13
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**File Structure**

- None - sequence of words, bytes
- Simple record structure
  - Lines
  - Fixed length
  - Variable length
- Complex Structures
  - Formatted document
  - Relocatable load file
- Can simulate last two with first method by inserting appropriate control characters
- Who decides:
  - Operating system
  - Program


- A collection of nodes containing information about all files
- Both the directory structure and the files reside on disk


**Operations Performed on Directory**

- Search for a file
- Create a file
- Delete a file
- List a directory
- Rename a file
- Traverse the file system


**Directory Organization**

- Efficiency – locating a file quickly
- Naming – convenient to users
  - Two users can have same name for different files
  - The same file can have several different names
- Grouping – logical grouping of files by properties, (e.g., all Java programs, all games, …)
- The directory is organized logically to obtain


**Single-Level Directory**

- A single directory for all users
- Naming problem
- Grouping problem


> **[ASSET ch13_ill_007]** Figure from slide 27
> - type: illustration
> - kind: other
> - file: assets/ch13_slide27_img007.png
> - src: slides 27
> - shows: Illustration from slide 27
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Two-Level Directory**

- Separate directory for each user
- Path name
- Can have the same file name for different user
- Efficient searching
- No grouping capability


> **[ASSET ch13_ill_008]** Figure from slide 28
> - type: illustration
> - kind: other
> - file: assets/ch13_slide28_img008.png
> - src: slides 28
> - shows: Illustration from slide 28
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Tree-Structured Directories**



> **[ASSET ch13_ill_009]** Figure from slide 29
> - type: illustration
> - kind: other
> - file: assets/ch13_slide29_img009.png
> - src: slides 29
> - shows: Illustration from slide 29
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Acyclic-Graph Directories**

- Have shared subdirectories and files
- Example


> **[ASSET ch13_ill_010]** Figure from slide 30
> - type: illustration
> - kind: other
> - file: assets/ch13_slide30_img010.jpg
> - src: slides 30
> - shows: Illustration from slide 30
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**Acyclic-Graph Directories (Cont.)**

- Two different names (aliasing)
- If dict deletes w/list  dangling pointer
- Solutions:
  - Backpointers, so we can delete all pointers.
    - Variable size records a problem
  - Backpointers using a daisy chain organization
  - Entry-hold-count solution
- New directory entry type
  - Link – another name (pointer) to an existing file
  - Resolve the link – follow pointer to locate the file


**General Graph Directory**



> **[ASSET ch13_ill_011]** Figure from slide 32
> - type: illustration
> - kind: other
> - file: assets/ch13_slide32_img011.jpg
> - src: slides 32
> - shows: Illustration from slide 32
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**General Graph Directory (Cont.)**

- How do we guarantee no cycles?
  - Allow only links to files not subdirectories
  - Garbage collection
  - Every time a new link is added use a cycle detection algorithm to determine whether it is OK


**Current Directory**

- Can designate one of the directories as the current (working) directory
  - cd /spell/mail/prog
  - type list
- Creating and deleting a file is done in current directory
- Example of creating a new file
  - If in current directory  is  /mail
  - The command
- mkdir <dir-name>
  - Results in:
  - Deleting “mail”  deleting the entire subtree rooted by “mail”


> **[ASSET ch13_ill_012]** Figure from slide 34
> - type: illustration
> - kind: other
> - file: assets/ch13_slide34_img012.jpg
> - src: slides 34
> - shows: Illustration from slide 34
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 13.3 Directory Structure
> id: ch13-13-3 | src: book 13.3 | kind: concept

The directory can be viewed as a symbol table that translates file names into
their file control blocks. If we take such a view, we see that the directory itself
can be organized in many ways. The organization must allow us to insert
entries, to delete entries, to search for a named entry, and to list all the entries
in the directory. In this section, we examine several schemes for defining the
logical structure of the directory system.
When considering a particular directory structure, we need to keep in mind
the operations that are to be performed on a directory:
• Search for a fil . We need to be able to search a directory structure to find
the entry for a particular file. Since files have symbolic names, and similar
File-System Interface
index file
relative file
Smith
last name
smith, john social-security age
logical record
number
Adams
Arthur
Asher
•
•
•
Figure 13.6
Example of index and relative files.
names may indicate a relationship among files, we may want to be able to
find all files whose names match a particular pattern.
• Create a fil . New files need to be created and added to the directory.
• Delete a file. When a file is no longer needed, we want to be able to remove
it from the directory. Note a delete leaves a hole in the directory structure
and the file system may have a method to defragement the directory
structure.
• List a directory. We need to be able to list the files in a directory and the
contents of the directory entry for each file in the list.
• Rename a file. Because the name of a file represents its contents to its users,
we must be able to change the name when the contents or use of the file
changes. Renaming a file may also allow its position within the directory
structure to be changed.
• Traverse the file system. We may wish to access every directory and every
file within a directory structure. For reliability, it is a good idea to save the
contents and structure of the entire file system at regular intervals. Often,
we do this by copying all files to magnetic tape, other secondary storage, or
across a network to another system or the cloud. This technique provides
a backup copy in case of system failure. In addition, if a file is no longer in
use, the file can be copied the backup target and the disk space of that file
released for reuse by another file.
In the following sections, we describe the most common schemes for defining
the logical structure of a directory.
Single-Level Directory
The simplest directory structure is the single-level directory. All files are con-
tained in the same directory, which is easy to support and understand (Figure
13.7).


## 13.3 Directory Structure
> id: ch13-13-3 | src: book 13.3 | kind: concept

cat
files
directory
bo
a
test
data
mail
cont
hex
records
Figure 13.7
Single-level directory.
A single-level directory has significant limitations, however, when the
number of files increases or when the system has more than one user. Since all
files are in the same directory, they must have unique names. If two users call
their data file test.txt, then the unique-name rule is violated. For example,
in one programming class, 23 students called the program for their second
assignment prog2.c; another 11 called it assign2.c. Fortunately, most file
systems support file names of up to 255 characters, so it is relatively easy to
select unique file names.
Even a single user on a single-level directory may find it difficult to remem-
ber the names of all the files as the number of files increases. It is not uncommon
for a user to have hundreds of files on one computer system and an equal
number of additional files on another system. Keeping track of so many files is
a daunting task.
Two-Level Directory
As we have seen, a single-level directory often leads to confusion of file names
among different users. The standard solution is to create a separate directory
for each user.
In the two-level directory structure, each user has his own user fil direc-
tory (UFD). The UFDs have similar structures, but each lists only the files of
a single user. When a user job starts or a user logs in, the system’s master
fil directory (MFD) is searched. The MFD is indexed by user name or account
number, and each entry points to the UFD for that user (Figure 13.8).
When a user refers to a particular file, only his own UFD is searched. Thus,
different users may have files with the same name, as long as all the file names
within each UFD are unique. To create a file for a user, the operating system
searches only that user’s UFD to ascertain whether another file of that name
cat
bo
a
test
x
data
a
a
user 1 user 2 user 3 user 4
data
a
test
user file
directory
master file
directory
Figure 13.8
Two-level directory structure.
File-System Interface
exists. To delete a file, the operating system confines its search to the local UFD;
thus, it cannot accidentally delete another user’s file that has the same name.
The user directories themselves must be created and deleted as necessary.
A special system program is run with the appropriate user name and account
information. The program creates a new UFD and adds an entry for it to the
MFD. The execution of this program might be restricted to system administra-
tors. The allocation of disk space for user directories can be handled with the
techniques discussed in Chapter 14 for files themselves.
Although the two-level directory structure solves the name-collision prob-
lem, it still has disadvantages. This structure effectively isolates one user from
another. Isolation is an advantage when the users are completely independent
but is a disadvantage when the users want to cooperate on some task and to
access one another’s files. Some systems simply do not allow local user files to
be accessed by other users.
If access is to be permitted, one user must have the ability to name a file
in another user’s directory. To name a particular file uniquely in a two-level
directory, we must give both the user name and the file name. A two-level
directory can be thought of as a tree, or an inverted tree, of height 2. The root
of the tree is the MFD. Its direct descendants are the UFDs. The descendants of
the UFDs are the files themselves. The files are the leaves of the tree. Specifying
a user name and a file name defines a path in the tree from the root (the MFD)
to a leaf (the specified file). Thus, a user name and a file name define a path
name. Every file in the system has a path name. To name a file uniquely, a user
must know the path name of the file desired.
For example, if user A wishes to access her own test file named test.txt,
she can simply refer to test.txt. To access the file named test.txt of user
B (with directory-entry name userb), however, she might have to refer to
/userb/test.txt. Every system has its own syntax for naming files in direc-
tories other than the user’s own.
Additional syntax is needed to specify the volume of a file. For instance,
in Windows a volume is specified by a letter followed by a colon. Thus, a
file specification might be C:∖userb∖test. Some systems go even further
and separate the volume, directory name, and file name parts of the speci-
fication. In OpenVMS, for instance, the file login.com might be specified as:
u:[sst.crissmeyer]login.com;1, where u is the name of the volume, sst
is the name of the directory, crissmeyer is the name of the subdirectory, and
1 is the version number. Other systems—such as UNIX and Linux—simply
treat the volume name as part of the directory name. The first name given
is that of the volume, and the rest is the directory and file. For instance,
/u/pgalvin/test might specify volume u, directory pgalvin, and file test.
A special instance of this situation occurs with the system files. Programs
provided as part of the system—loaders, assemblers, compilers, utility rou-
tines, libraries, and so on—are generally defined as files. When the appropriate
commands are given to the operating system, these files are read by the loader
and executed. Many command interpreters simply treat such a command as
the name of a file to load and execute. In the directory system as we defined it
above, this file name would be searched for in the current UFD. One solution
would be to copy the system files into each UFD. However, copying all the
system files would waste an enormous amount of space. (If the system files


## 13.3 Directory Structure
> id: ch13-13-3 | src: book 13.3 | kind: concept

require 5 MB, then supporting 12 users would require 5 × 12 = 60 MB just for
copies of the system files.)
The standard solution is to complicate the search procedure slightly. A
special user directory is defined to contain the system files (for example, user
0). Whenever a file name is given to be loaded, the operating system first
searches the local UFD. If the file is found, it is used. If it is not found, the system
automatically searches the special user directory that contains the system files.
The sequence of directories searched when a file is named is called the search
path. The search path can be extended to contain an unlimited list of directories
to search when a command name is given. This method is the one most used
in UNIX and Windows. Systems can also be designed so that each user has his
own search path.
Tree-Structured Directories
Once we have seen how to view a two-level directory as a two-level tree,
the natural generalization is to extend the directory structure to a tree of
arbitrary height (Figure 13.9). This generalization allows users to create their
own subdirectories and to organize their files accordingly. A tree is the most
common directory structure. The tree has a root directory, and every file in the
system has a unique path name.
A directory (or subdirectory) contains a set of files or subdirectories. In
many implementations, a directory is simply another file, but it is treated in
a special way. All directories have the same internal format. One bit in each
directory entry defines the entry as a file (0) or as a subdirectory (1). Special
list
obj
spell
find
count
hex
reorder
stat
mail
dist
root
spell
bin
programs
p
e
mail
reorder
list
find
prog
copy
prt
exp
last
first
hex
count
all
Figure 13.9
Tree-structured directory structure.
File-System Interface
system calls are used to create and delete directories. In this case the operating
system (or the file system code) implements another file format, that of a
directory.
In normal use, each process has a current directory. The current directory
should contain most of the files that are of current interest to the process. When
reference is made to a file, the current directory is searched. If a file is needed
that is not in the current directory, then the user usually must either specify a
path name or change the current directory to be the directory holding that file.
To change directories, a system call could be provided that takes a directory
name as a parameter and uses it to redefine the current directory. Thus, the user
can change her current directory whenever she wants. Other systems leave it
to the application (say, a shell) to track and operate on a current directory, as
each process could have different current directories.
The initial current directory of a user’s login shell is designated when the
user job starts or the user logs in. The operating system searches the accounting
file (or some other predefined location) to find an entry for this user (for
accounting purposes). In the accounting file is a pointer to (or the name of)
the user’s initial directory. This pointer is copied to a local variable for this user
that specifies the user’s initial current directory. From that shell, other processes
can be spawned. The current directory of any subprocess is usually the current
directory of the parent when it was spawned.
Path names can be of two types: absolute and relative. In UNIX and Linux,
an absolute path name begins at the root (which is designated by an initial
“/”) and follows a path down to the specified file, giving the directory names
on the path. Arelative path name defines a path from the current directory. For
example, in the tree-structured file system of Figure 13.9, if the current directory
is /spell/mail, then the relative path name prt/first refers to the same file
as does the absolute path name /spell/mail/prt/first.
Allowing a user to define her own subdirectories permits her to impose
a structure on her files. This structure might result in separate directories for
files associated with different topics (for example, a subdirectory was created
to hold the text of this book) or different forms of information. For example, the
directory programs may contain source programs; the directory bin may store
all the binaries. (As a side note, executable files were known in many systems
as “binaries” which led to them being stored in the bin directory.)
An interesting policy decision in a tree-structured directory concerns how
to handle the deletion of a directory. If a directory is empty, its entry in the
directory that contains it can simply be deleted. However, suppose the direc-
tory to be deleted is not empty but contains several files or subdirectories. One
of two approaches can be taken. Some systems will not delete a directory unless
it is empty. Thus, to delete a directory, the user must first delete all the files
in that directory. If any subdirectories exist, this procedure must be applied
recursively to them, so that they can be deleted also. This approach can result
in a substantial amount of work. An alternative approach, such as that taken
by the UNIX rm command, is to provide an option: when a request is made
to delete a directory, all that directory’s files and subdirectories are also to be
deleted. Either approach is fairly easy to implement; the choice is one of policy.
The latter policy is more convenient, but it is also more dangerous, because an
entire directory structure can be removed with one command. If that command


## 13.3 Directory Structure
> id: ch13-13-3 | src: book 13.3 | kind: concept

is issued in error, a large number of files and directories will need to be restored
(assuming a backup exists).
With a tree-structured directory system, users can be allowed to access, in
addition to their files, the files of other users. For example, user B can access a
file of user A by specifying its path name. User B can specify either an absolute
or a relative path name. Alternatively, user B can change her current directory
to be user A’s directory and access the file by its file name.
Acyclic-Graph Directories
Consider two programmers who are working on a joint project. The files asso-
ciated with that project can be stored in a subdirectory, separating them from
other projects and files of the two programmers. But since both programmers
are equally responsible for the project, both want the subdirectory to be in their
own directories. In this situation, the common subdirectory should be shared.
A shared directory or file exists in the file system in two (or more) places at
once.
A tree structure prohibits the sharing of files or directories. An acyclic
graph—that is, a graph with no cycles—allows directories to share subdirec-
tories and files (Figure 13.10). The same file or subdirectory may be in two
different directories. The acyclic graph is a natural generalization of the tree-
structured directory scheme.
It is important to note that a shared file (or directory) is not the same as two
copies of the file. With two copies, each programmer can view the copy rather
than the original, but if one programmer changes the file, the changes will not
appear in the other’s copy. With a shared file, only one actual file exists, so any
changes made by one person are immediately visible to the other. Sharing is
list
all
w
count words
list
list
rade
w7
count
root
dict
spell
Figure 13.10
Acyclic-graph directory structure.
File-System Interface
particularly important for subdirectories; a new file created by one person will
automatically appear in all the shared subdirectories.
When people are working as a team, all the files they want to share can be
put into one directory. The home directory of each team member could contain
this directory of shared files as a subdirectory. Even in the case of a single user,
the user’s file organization may require that some file be placed in different
subdirectories. For example, a program written for a particular project should
be both in the directory of all programs and in the directory for that project.
Shared files and subdirectories can be implemented in several ways. A
common way, exemplified by UNIX systems, is to create a new directory entry
called a link. A link is effectively a pointer to another file or subdirectory. For
example, a link may be implemented as an absolute or a relative path name.
When a reference to a file is made, we search the directory. If the directory
entry is marked as a link, then the name of the real file is included in the link
information. We resolve the link by using that path name to locate the real
file. Links are easily identified by their format in the directory entry (or by
having a special type on systems that support types) and are effectively indirect
pointers. The operating system ignores these links when traversing directory
trees to preserve the acyclic structure of the system.
Another common approach to implementing shared files is simply to
duplicate all information about them in both sharing directories. Thus, both
entries are identical and equal. Consider the difference between this approach
and the creation of a link. The link is clearly different from the original directory
entry; thus, the two are not equal. Duplicate directory entries, however, make
the original and the copy indistinguishable. A major problem with duplicate
directory entries is maintaining consistency when a file is modified.
An acyclic-graph directory structure is more flexible than a simple tree
structure, but it is also more complex. Several problems must be considered
carefully. A file may now have multiple absolute path names. Consequently,
distinct file names may refer to the same file. This situation is similar to the
aliasing problem for programming languages. If we are trying to traverse the
entire file system—to find a file, to accumulate statistics on all files, or to copy
all files to backup storage—this problem becomes significant, since we do not
want to traverse shared structures more than once.
Another problem involves deletion. When can the space allocated to a
shared file be deallocated and reused? One possibility is to remove the file
whenever anyone deletes it, but this action may leave dangling pointers to the
now-nonexistent file. Worse, if the remaining file pointers contain actual disk
addresses, and the space is subsequently reused for other files, these dangling
pointers may point into the middle of other files.
In a system where sharing is implemented by symbolic links, this situation
is somewhat easier to handle. The deletion of a link need not affect the original
file; only the link is removed. If the file entry itself is deleted, the space for
the file is deallocated, leaving the links dangling. We can search for these links
and remove them as well, but unless a list of the associated links is kept with
each file, this search can be expensive. Alternatively, we can leave the links
until an attempt is made to use them. At that time, we can determine that the
file of the name given by the link does not exist and can fail to resolve the
link name; the access is treated just as with any other illegal file name. (In this
case, the system designer should consider carefully what to do when a file is


## 13.3 Directory Structure
> id: ch13-13-3 | src: book 13.3 | kind: concept

deleted and another file of the same name is created, before a symbolic link to
the original file is used.) In the case of UNIX, symbolic links are left when a file
is deleted, and it is up to the user to realize that the original file is gone or has
been replaced. Microsoft Windows uses the same approach.
Another approach to deletion is to preserve the file until all references to
it are deleted. To implement this approach, we must have some mechanism
for determining that the last reference to the file has been deleted. We could
keep a list of all references to a file (directory entries or symbolic links). When
a link or a copy of the directory entry is established, a new entry is added to
the file-reference list. When a link or directory entry is deleted, we remove its
entry on the list. The file is deleted when its file-reference list is empty.
The trouble with this approach is the variable and potentially large size of
the file-reference list. However, we really do not need to keep the entire list
—we need to keep only a count of the number of references. Adding a new
link or directory entry increments the reference count. Deleting a link or entry
decrements the count. When the count is 0, the file can be deleted; there are no
remaining references to it. The UNIX operating system uses this approach for
nonsymbolic links (or hard links), keeping a reference count in the file infor-
mation block (or inode; see Section C.7.2). By effectively prohibiting multiple
references to directories, we maintain an acyclic-graph structure.
To avoid problems such as the ones just discussed, some systems simply
do not allow shared directories or links.
General Graph Directory
A serious problem with using an acyclic-graph structure is ensuring that there
are no cycles. If we start with a two-level directory and allow users to create
subdirectories, a tree-structured directory results. It should be fairly easy to see
that simply adding new files and subdirectories to an existing tree-structured
directory preserves the tree-structured nature. However, when we add links,
the tree structure is destroyed, resulting in a simple graph structure (Figure
13.11).
The primary advantage of an acyclic graph is the relative simplicity of the
algorithms to traverse the graph and to determine when there are no more
references to a file. We want to avoid traversing shared sections of an acyclic
graph twice, mainly for performance reasons. If we have just searched a major
shared subdirectory for a particular file without finding it, we want to avoid
searching that subdirectory again; the second search would be a waste of time.
If cycles are allowed to exist in the directory, we likewise want to avoid
searching any component twice, for reasons of correctness as well as perfor-
mance. Apoorly designed algorithm might result in an infinite loop continually
searching through the cycle and never terminating. One solution is to limit
arbitrarily the number of directories that will be accessed during a search.
A similar problem exists when we are trying to determine when a file
can be deleted. With acyclic-graph directory structures, a value of 0 in the
reference count means that there are no more references to the file or directory,
and the file can be deleted. However, when cycles exist, the reference count
may not be 0 even when it is no longer possible to refer to a directory or file.
This anomaly results from the possibility of self-referencing (or a cycle) in the
directory structure. In this case, we generally need to use a garbage collection
File-System Interface
text
mail
avi
count
unhex
hex
count
book
book
mail
unhex
hyp
root
avi
tc
jim
Figure 13.11
General graph directory.
scheme to determine when the last reference has been deleted and the disk
space can be reallocated. Garbage collection involves traversing the entire file
system, marking everything that can be accessed. Then, a second pass collects
everything that is not marked onto a list of free space. (A similar marking
procedure can be used to ensure that a traversal or search will cover everything
in the file system once and only once.) Garbage collection for a disk-based file
system, however, is extremely time consuming and is thus seldom attempted.
Garbage collection is necessary only because of possible cycles in the graph.
Thus, an acyclic-graph structure is much easier to work with. The difficulty is to
avoid cycles as new links are added to the structure. How do we know when a
new link will complete a cycle? There are algorithms to detect cycles in graphs;
however, they are computationally expensive, especially when the graph is on
disk storage. A simpler algorithm in the special case of directories and links
is to bypass links during directory traversal. Cycles are avoided, and no extra
overhead is incurred.


## 13.4 Protection
> id: ch13-13-4 | src: book 13.4; slides 35-38 | kind: concept

When information is stored in a computer system, we want to keep it safe
from physical damage (the issue of reliability) and improper access (the issue
of protection).
Reliability is generally provided by duplicate copies of files. Many comput-
ers have systems programs that automatically (or through computer-operator
intervention) copy disk files to tape at regular intervals (once per day or week
or month) to maintain a copy should a file system be accidentally destroyed.
File systems can be damaged by hardware problems (such as errors in reading
or writing), power surges or failures, head crashes, dirt, temperature extremes,


- File owner/creator should be able to control:
  - What can be done
  - By whom
- Types of access
  - Read
  - Write
  - Execute
  - Append
  - Delete
  - List


**Access Lists and Groups in Unix**

- Mode of access:  read, write, execute
- Three classes of users on Unix / Linux
- RWX
- a) owner access 	7		1 1 1				RWX
- b) group access 	6	 	1 1 0
- RWX
- c) public access	1	 	0 0 1
- Ask manager to create a group (unique name), say G, and add some users to the group.
- For a file (say game) or subdirectory, define an appropriate access.
- Attach a group to a file
- chgrp     G    game


> **[ASSET ch13_ill_013]** Figure from slide 36
> - type: illustration
> - kind: other
> - file: assets/ch13_slide36_img013.jpg
> - src: slides 36
> - shows: Illustration from slide 36
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

**A Sample UNIX Directory Listing**



**Windows 7 Access-Control List Management**



> **[ASSET ch13_ill_014]** Figure from slide 38
> - type: illustration
> - kind: other
> - file: assets/ch13_slide38_img014.png
> - src: slides 38
> - shows: Illustration from slide 38
> - structure: [PENDING VISION EXTRACTION]
> - text_in_image: [PENDING VISION EXTRACTION]
> - confidence: low

## 13.4 Protection
> id: ch13-13-4 | src: book 13.4 | kind: concept

and vandalism. Files may be deleted accidentally. Bugs in the file-system soft-
ware can also cause file contents to be lost. Reliability was covered in more
detail in Chapter 11.
Protection can be provided in many ways. For a laptop system running
a modern operating system, we might provide protection by requiring a user
name and password authentication to access it, encrypting the secondary stor-
age so even someone opening the laptop and removing the drive would have
a difficult time accessing its data, and firewalling network access so that when
it is in use it is difficult to break in via its network connection. In multiuser
system, even valid access of the system needs more advanced mechanisms to
allow only valid access of the data.
Types of Access
The need to protect files is a direct result of the ability to access files. Systems
that do not permit access to the files of other users do not need protection. Thus,
we could provide complete protection by prohibiting access. Alternatively, we
could provide free access with no protection. Both approaches are too extreme
for general use. What is needed is controlled access.
Protection mechanisms provide controlled access by limiting the types of
file access that can be made. Access is permitted or denied depending on
several factors, one of which is the type of access requested. Several different
types of operations may be controlled:
• Read. Read from the file.
• Write. Write or rewrite the file.
• Execute. Load the file into memory and execute it.
• Append. Write new information at the end of the file.
• Delete. Delete the file and free its space for possible reuse.
• List. List the name and attributes of the file.
• Attribute change. Changing the attributes of the file.
Other operations, such as renaming, copying, and editing the file, may also
be controlled. For many systems, however, these higher-level functions may
be implemented by a system program that makes lower-level system calls.
Protection is provided at only the lower level. For instance, copying a file may
be implemented simply by a sequence of read requests. In this case, a user with
read access can also cause the file to be copied, printed, and so on.
Many protection mechanisms have been proposed. Each has advantages
and disadvantages and must be appropriate for its intended application. A
small computer system that is used by only a few members of a research group,
for example, may not need the same types of protection as a large corporate
computer that is used for research, finance, and personnel operations. We
discuss some approaches to protection in the following sections and present
a more complete treatment in Chapter 17.
File-System Interface
Access Control
The most common approach to the protection problem is to make access depen-
dent on the identity of the user. Different users may need different types of
access to a file or directory. The most general scheme to implement identity-
dependent access is to associate with each file and directory an access-control
list (ACL) specifying user names and the types of access allowed for each user.
When a user requests access to a particular file, the operating system checks
the access list associated with that file. If that user is listed for the requested
access, the access is allowed. Otherwise, a protection violation occurs, and the
user job is denied access to the file.
This approach has the advantage of enabling complex access methodolo-
gies. The main problem with access lists is their length. If we want to allow
everyone to read a file, we must list all users with read access. This technique
has two undesirable consequences:
• Constructing such a list may be a tedious and unrewarding task, especially
if we do not know in advance the list of users in the system.
• The directory entry, previously of fixed size, now must be of variable size,
resulting in more complicated space management.
These problems can be resolved by use of a condensed version of the access
list.
To condense the length of the access-control list, many systems recognize
three classifications of users in connection with each file:
• Owner. The user who created the file is the owner.
• Group. A set of users who are sharing the file and need similar access is a
group, or work group.
• Other. All other users in the system.
The most common recent approach is to combine access-control lists with
the more general (and easier to implement) owner, group, and universe access-
control scheme just described. For example, Solaris uses the three categories of
access by default but allows access-control lists to be added to specific files and
directories when more fine-grained access control is desired.
To illustrate, consider a person, Sara, who is writing a new book. She has
hired three graduate students (Jim, Dawn, and Jill) to help with the project. The
text of the book is kept in a file named book.tex. The protection associated
with this file is as follows:
• Sara should be able to invoke all operations on the file.
• Jim, Dawn, and Jill should be able only to read and write the file; they
should not be allowed to delete the file.
• All other users should be able to read, but not write, the file. (Sara is
interested in letting as many people as possible read the text so that she
can obtain feedback.)


## 13.4 Protection
> id: ch13-13-4 | src: book 13.4 | kind: concept

PERMISSIONS IN A UNIX SYSTEM
In the UNIX system, directory protection and file protection are handled
similarly. Associated with each file and directory are three fields—owner,
group, and universe—each consisting of the three bits rwx, where r controls
read access, w controls write access, and x controls execution. Thus, a user can
list the content of a subdirectory only if the r bit is set in the appropriate field.
Similarly, a user can change his current directory to another current directory
(say, foo) only if the x bit associated with the foo subdirectory is set in the
appropriate field.
A sample directory listing from a UNIX environment is shown in below:
-rw-rw-r--
drwx------
drwxrwxr-x
drwxrwx---
-rw-r--r--
-rwxr-xr-x
drwx--x--x
drwx------
drwxrwxrwx
1 pbg
5 pbg
2 pbg
2 jwg
1 pbg
1 pbg
4 tag
3 pbg
3 pbg
staff
staff
staff
student
staff
staff
faculty
staff
staff
intro.ps
private/
doc/
student-proj/
program.c
program
lib/
mail/
test/
Sep 3 08:30
Jul 8 09.33
Jul 8 09:35
Aug 3 14:13
Feb 24 2017
Feb 24 2017
Jul 31 10:31
Aug 29 06:52
Jul 8 09:35
The first field describes the protection of the file or directory. A d as the first
character indicates a subdirectory. Also shown are the number of links to the
file, the owner’s name, the group’s name, the size of the file in bytes, the date
of last modification, and finally the file’s name (with optional extension).
To achieve such protection, we must create a new group—say, text—
with members Jim, Dawn, and Jill. The name of the group, text, must then
be associated with the file book.tex, and the access rights must be set in
accordance with the policy we have outlined.
Now consider a visitor to whom Sara would like to grant temporary access
to Chapter 1. The visitor cannot be added to the text group because that would
give him access to all chapters. Because a file can be in only one group, Sara
cannot add another group to Chapter 1. With the addition of access-control-
list functionality, though, the visitor can be added to the access control list of
Chapter 1.
For this scheme to work properly, permissions and access lists must be con-
trolled tightly. This control can be accomplished in several ways. For example,
in the UNIX system, groups can be created and modified only by the manager
of the facility (or by any superuser). Thus, control is achieved through human
interaction. Access lists are discussed further in Section 17.6.2.
With the more limited protection classification, only three fields are needed
to define protection. Often, each field is a collection of bits, and each bit either
allows or prevents the access associated with it. For example, the UNIX system
defines three fields of three bits each—rwx, where r controls read access, w
controls write access, and x controls execution. A separate field is kept for the
File-System Interface
file owner, for the file’s group, and for all other users. In this scheme, nine bits
per file are needed to record protection information. Thus, for our example, the
protection fields for the file book.tex are as follows: for the owner Sara, all bits
are set; for the group text, the r and w bits are set; and for the universe, only
the r bit is set.
One difficulty in combining approaches comes in the user interface. Users
must be able to tell when the optional ACL permissions are set on a file. In the
Solaris example, a “+” is appended to the regular permissions, as in:
19 -rw-r--r--+ 1 jim staff 130 May 25 22:13 file1
A separate set of commands, setfacl and getfacl, is used to manage the
ACLs.
Windows users typically manage access-control lists via the GUI. Figure


## 13.12 shows a file-permission window on Windows 7 NTFS file system. In this
> id: ch13-13-12 | src: book 13.12 | kind: concept

example, user “guest” is specifically denied access to the file ListPanel.java.
Another difficulty is assigning precedence when permission and ACLs
conflict. For example, if Walter is in a file’s group, which has read permission,
but the file has an ACL granting Walter read and write permission, should a
write by Walter be granted or denied? Solaris and other operating systems
give ACLs precedence (as they are more fine-grained and are not assigned by
default). This follows the general rule that specificity should have priority.
Other Protection Approaches
Another approach to the protection problem is to associate a password with
each file. Just as access to the computer system is often controlled by a pass-
word, access to each file can be controlled in the same way. If the passwords
are chosen randomly and changed often, this scheme may be effective in lim-
iting access to a file. The use of passwords has a few disadvantages, however.
First, the number of passwords that a user needs to remember may become
large, making the scheme impractical. Second, if only one password is used for
all the files, then once it is discovered, all files are accessible; protection is on
an all-or-none basis. Some systems allow a user to associate a password with
a subdirectory, rather than with an individual file, to address this problem.
More commonly encryption of a partition or individual files provides strong
protection, but password management is key.
In a multilevel directory structure, we need to protect not only individual
files but also collections of files in subdirectories; that is, we need to provide
a mechanism for directory protection. The directory operations that must be
protected are somewhat different from the file operations. We want to control
the creation and deletion of files in a directory. In addition, we probably want
to control whether a user can determine the existence of a file in a directory.
Sometimes, knowledge of the existence and name of a file is significant in
itself. Thus, listing the contents of a directory must be a protected operation.
Similarly, if a path name refers to a file in a directory, the user must be allowed
access to both the directory and the file. In systems where files may have
numerous path names (such as acyclic and general graphs), a given user may
have different access rights to a particular file, depending on the path name
used.


## 13.5 Memory-Mapped Files
> id: ch13-13-5 | src: book 13.5; slides 39-40 | kind: concept

Figure 13.12
Windows 10 access-control list management.




**End of Chapter 13**



## 13.5 Memory-Mapped Files
> id: ch13-13-5 | src: book 13.5 | kind: concept

There is one other method of accessing files, and it is very commonly used.
Consider a sequential read of a file on disk using the standard system calls
open(), read(), and write(). Each file access requires a system call and disk
access. Alternatively, we can use the virtual memory techniques discussed in
Chapter 10 to treat file I/O as routine memory accesses. This approach, known
as memory mapping a file, allows a part of the virtual address space to be
logically associated with the file. As we shall see, this can lead to significant
performance increases.
Basic Mechanism
Memory mapping a file is accomplished by mapping a disk block to a page (or
pages) in memory. Initial access to the file proceeds through ordinary demand
File-System Interface
paging, resulting in a page fault. However, a page-sized portion of the file is
read from the file system into a physical page (some systems may opt to read
in more than a page-sized chunk of memory at a time). Subsequent reads and
writes to the file are handled as routine memory accesses. Manipulating files
through memory rather than incurring the overhead of using the read() and
write() system calls simplifies and speeds up file access and usage.
Note that writes to the file mapped in memory are not necessarily imme-
diate (synchronous) writes to the file on secondary storage. Generally, systems
update the file based on changes to the memory image only when the file is
closed. Under memory pressure, systems will have any intermediate changes
to swap space to not lose them when freeing memory for other uses. When
the file is closed, all the memory-mapped data are written back to the file on
secondary storage and removed from the virtual memory of the process.
Some operating systems provide memory mapping only through a specific
system call and use the standard system calls to perform all other file I/O.
However, some systems choose to memory-map a file regardless of whether the
file was specified as memory-mapped. Let’s take Solaris as an example. If a file
is specified as memory-mapped (using the mmap() system call), Solaris maps
the file into the address space of the process. If a file is opened and accessed
using ordinary system calls, such as open(), read(), and write(), Solaris still
memory-maps the file; however, the file is mapped to the kernel address space.
Regardless of how the file is opened, then, Solaris treats all file I/O as memory-
mapped, allowing file access to take place via the efficient memory subsystem
and avoiding system call overhead caused by each traditional read() and
write().
Multiple processes may be allowed to map the same file concurrently, to
allow sharing of data. Writes by any of the processes modify the data in virtual
memory and can be seen by all others that map the same section of the file.
Given our earlier discussions of virtual memory, it should be clear how the
sharing of memory-mapped sections of memory is implemented: the virtual
memory map of each sharing process points to the same page of physical
memory—the page that holds a copy of the disk block. This memory sharing is
illustrated in Figure 13.13. The memory-mapping system calls can also support
copy-on-write functionality, allowing processes to share a file in read-only
mode but to have their own copies of any data they modify. So that access
to the shared data is coordinated, the processes involved might use one of the
mechanisms for achieving mutual exclusion described in Chapter 6.
Quite often, shared memory is in fact implemented by memory mapping
files. Under this scenario, processes can communicate using shared mem-
ory by having the communicating processes memory-map the same file into
their virtual address spaces. The memory-mapped file serves as the region
of shared memory between the communicating processes (Figure 13.14). We
have already seen this in Section 3.5, where a POSIX shared-memory object
is created and each communicating process memory-maps the object into its
address space. In the following section, we discuss support in the Windows
API for shared memory using memory-mapped files.
Shared Memory in the Windows API
The general outline for creating a region of shared memory using memory-
mapped files in the Windows API involves first creating a fil mapping for the


## 13.5 Memory-Mapped Files
> id: ch13-13-5 | src: book 13.5 | kind: concept

process A
virtual memory
process B
virtual memory
physical memory
disk file
Figure 13.13
Memory-mapped files.
file to be mapped and then establishing a view of the mapped file in a process’s
virtual address space. A second process can then open and create a view of
the mapped file in its virtual address space. The mapped file represents the
shared-memory object that will enable communication to take place between
the processes.
We next illustrate these steps in more detail. In this example, a producer
process first creates a shared-memory object using the memory-mapping fea-
tures available in the Windows API. The producer then writes a message to
shared memory. After that, a consumer process opens a mapping to the shared-
memory object and reads the message written by the consumer.
process1
memory-mapped
file
shared
memory
shared
memory
shared
memory
process2
Figure 13.14
Shared memory using memory-mapped I/O.
File-System Interface
To establish a memory-mapped file, a process first opens the file to be
mapped with the CreateFile() function, which returns a HANDLE to the
opened file. The process then creates a mapping of this file HANDLE using the
CreateFileMapping() function. Once the file mapping is done, the process
establishes a view of the mapped file in its virtual address space with the
MapViewOfFile() function. The view of the mapped file represents the por-
tion of the file being mapped in the virtual address space of the process—the
entire file or only a portion of it may be mapped. This sequence in the program
#include <windows.h>
#include <stdio.h>
int main(int argc, char *argv[])
{
HANDLE hFile, hMapFile;
LPVOID lpMapAddress;
hFile = CreateFile("temp.txt", /* file name */
GENERIC READ | GENERIC WRITE, /* read/write access */
0, /* no sharing of the file */
NULL, /* default security */
OPEN ALWAYS, /* open new or existing file */
FILE ATTRIBUTE NORMAL, /* routine file attributes */
NULL); /* no file template */
hMapFile = CreateFileMapping(hFile, /* file handle */
NULL, /* default security */
PAGE READWRITE, /* read/write access to mapped pages */
0, /* map entire file */
0,
TEXT("SharedObject")); /* named shared memory object */
lpMapAddress = MapViewOfFile(hMapFile, /* mapped object handle */
FILE MAP ALL ACCESS, /* read/write access */
0, /* mapped view of entire file */
0,
0);
/* write to shared memory */
sprintf(lpMapAddress,"Shared memory message");
UnmapViewOfFile(lpMapAddress);
CloseHandle(hFile);
CloseHandle(hMapFile);
}
Figure 13.15
Producer writing to shared memory using the Windows API.


## 13.5 Memory-Mapped Files
> id: ch13-13-5 | src: book 13.5 | kind: concept

is shown in Figure 13.15. (We eliminate much of the error checking for code
brevity.)
The call to CreateFileMapping() creates a named shared-memory object
called SharedObject. The consumer process will communicate using this
shared-memory segment by creating a mapping to the same named object.
The producer then creates a view of the memory-mapped file in its virtual
address space. By passing the last three parameters the value 0, it indicates
that the mapped view is the entire file. It could instead have passed values
specifying an offset and size, thus creating a view containing only a subsection
of the file. (It is important to note that the entire mapping may not be loaded
into memory when the mapping is established. Rather, the mapped file may be
demand-paged, thus bringing pages into memory only as they are accessed.)
The MapViewOfFile() function returns a pointer to the shared-memory object;
any accesses to this memory location are thus accesses to the memory-mapped
file. In this instance, the producer process writes the message “Shared memory
message” to shared memory.
A program illustrating how the consumer process establishes a view of
the named shared-memory object is shown in Figure 13.16. This program is
#include <windows.h>
#include <stdio.h>
int main(int argc, char *argv[])
{
HANDLE hMapFile;
LPVOID lpMapAddress;
hMapFile = OpenFileMapping(FILE MAP ALL ACCESS, /* R/W access */
FALSE, /* no inheritance */
TEXT("SharedObject")); /* name of mapped file object */
lpMapAddress = MapViewOfFile(hMapFile, /* mapped object handle */
FILE MAP ALL ACCESS, /* read/write access */
0, /* mapped view of entire file */
0,
0);
/* read from shared memory */
printf("Read message %s", lpMapAddress);
UnmapViewOfFile(lpMapAddress);
CloseHandle(hMapFile);
}
Figure 13.16
Consumer reading from shared memory using the Windows API.
File-System Interface
somewhat simpler than the one shown in Figure 13.15, as all that is necessary
is for the process to create a mapping to the existing named shared-memory
object. The consumer process must also create a view of the mapped file, just
as the producer process did in the program in Figure 13.15. The consumer then
reads from shared memory the message “Shared memory message” that was
written by the producer process.
Finally, both processes remove the view of the mapped file with a call to
UnmapViewOfFile(). We provide a programming exercise at the end of this
chapter using shared memory with memory mapping in the Windows API.


## 13.6 Summary
> id: ch13-13-6 | src: book 13.6 | kind: concept

• A file is an abstract data type defined and implemented by the operating
system. It is a sequence of logical records. A logical record may be a byte,
a line (of fixed or variable length), or a more complex data item. The
operating system may specifically support various record types or may
leave that support to the application program.
• A major task for the operating system is to map the logical file concept
onto physical storage devices such as hard disk or NVM device. Since the
physical record size of the device may not be the same as the logical record
size, it may be necessary to order logical records into physical records.
Again, this task may be supported by the operating system or left for the
application program.
• Within a file system, it is useful to create directories to allow files to be
organized. A single-level directory in a multiuser system causes naming
problems, since each file must have a unique name. A two-level directory
solves this problem by creating a separate directory for each user’s files.
The directory lists the files by name and includes the file’s location on the
disk, length, type, owner, time of creation, time of last use, and so on.
• The natural generalization of a two-level directory is a tree-structured
directory. A tree-structured directory allows a user to create subdirectories
to organize files. Acyclic-graph directory structures enable users to share
subdirectories and files but complicate searching and deletion. A general
graph structure allows complete flexibility in the sharing of files and direc-
tories but sometimes requires garbage collection to recover unused disk
space.
• Remote file systems present challenges in reliability, performance, and
security. Distributed information systems maintain user, host, and access
information so that clients and servers can share state information to man-
age use and access.
• Since files are the main information-storage mechanism in most computer
systems, file protection is needed on multiuser systems. Access to files
can be controlled separately for each type of access—read, write, execute,
append, delete, list directory, and so on. File protection can be provided by
access lists, passwords, or other techniques.
Further Reading


## Practice Exercises
> id: ch13-practice-exercises | src: book Practice Exercises | kind: concept




## 13.1 Some systems automatically delete all user files when a user logs off or
> id: ch13-13-1 | src: book 13.1 | kind: concept

a job terminates, unless the user explicitly requests that they be kept.
Other systems keep all files unless the user explicitly deletes them.
Discuss the relative merits of each approach.


## 13.2 Why do some systems keep track of the type of a file, while still others
> id: ch13-13-2 | src: book 13.2 | kind: concept

leave it to the user and others simply do not implement multiple file
types? Which system is “better”?


## 13.3 Similarly, some systems support many types of structures for a file’s
> id: ch13-13-3 | src: book 13.3 | kind: concept

data, while others simply support a stream of bytes. What are the
advantages and disadvantages of each approach?


## 13.4 Could you simulate a multilevel directory structure with a single-level
> id: ch13-13-4 | src: book 13.4 | kind: concept

directory structure in which arbitrarily long names can be used? If your
answer is yes, explain how you can do so, and contrast this scheme
with the multilevel directory scheme. If your answer is no, explain what
prevents your simulation’s success. How would your answer change if
file names were limited to seven characters?


## 13.5 Explain the purpose of the open() and close() operations.
> id: ch13-13-5 | src: book 13.5 | kind: concept




## 13.6 In some systems, a subdirectory can be read and written by an autho-
> id: ch13-13-6 | src: book 13.6 | kind: concept

rized user, just as ordinary files can be.
a.
Describe the protection problems that could arise.
b.
Suggest a scheme for dealing with each of these protection prob-
lems.


## 13.7 Consider a system that supports 5,000 users. Suppose that you want to
> id: ch13-13-7 | src: book 13.7 | kind: concept

allow 4,990 of these users to be able to access one file.
a.
How would you specify this protection scheme in UNIX?
b.
Can you suggest another protection scheme that can be used more
effectively for this purpose than the scheme provided by UNIX?


## 13.8 Researchers have suggested that, instead of having an access-control
> id: ch13-13-8 | src: book 13.8 | kind: concept

list associated with each file (specifying which users can access the file,
and how), we should have a user control list associated with each user
(specifying which files a user can access, and how). Discuss the relative
merits of these two schemes.
Further Reading
A multilevel directory structure was first implemented on the MULTICS system
([Organick (1972)]). Most operating systems now implement multilevel direc-
tory structures. These include Linux ([Love (2010)]), macOS ([Singh (2007)]),
Solaris ([McDougall and Mauro (2007)]), and all versions of Windows ([Russi-
novich et al. (2017)]).
File-System Interface
A general discussion of Solaris file systems is found in the Sun Sys-
tem Administration Guide: Devices and File Systems (http://docs.sun.com/app/
docs/doc/817-5093).
The network file system (NFS), designed by Sun Microsystems, allows
directory structures to be spread across networked computer systems. NFS
Version 4 is described in RFC3505 (http://www.ietf.org/rfc/rfc3530.txt).
A great source of the meanings of computer jargon is http://www.catb.org/
esr/jargon/.
Bibliography
[Love (2010)]
R. Love, Linux Kernel Development, Third Edition, Developer’s
Library (2010).
[McDougall and Mauro (2007)]
R. McDougall and J. Mauro, Solaris Internals,
Second Edition, Prentice Hall (2007).
[Organick (1972)]
E. I. Organick, The Multics System: An Examination of Its Struc-
ture, MIT Press (1972).
[Russinovich et al. (2017)]
M. Russinovich, D. A. Solomon, and A. Ionescu, Win-
dows Internals–Part 1, Seventh Edition, Microsoft Press (2017).
[Singh (2007)]
A. Singh, Mac OS X Internals: A Systems Approach, Addison-
Wesley (2007).


## Exercises
> id: ch13-exercises | src: book Exercises | kind: concept




## 13.9 Consider a file system in which a file can be deleted and its disk space
> id: ch13-13-9 | src: book 13.9 | kind: concept

reclaimed while links to that file still exist. What problems may occur if
a new file is created in the same storage area or with the same absolute
path name? How can these problems be avoided?
The open-file table is used to maintain information about files that are
currently open. Should the operating system maintain a separate table
for each user or maintain just one table that contains references to files
that are currently being accessed by all users? If the same file is being
accessed by two different programs or users, should there be separate
entries in the open-file table? Explain.
What are the advantages and disadvantages of providing mandatory
locks instead of advisory locks whose use is left to users’ discretion?
Provide examples of applications that typically access files according
to the following methods:
• Sequential
• Random
Some systems automatically open a file when it is referenced for the first
time and close the file when the job terminates. Discuss the advantages
and disadvantages of this scheme compared with the more traditional
one, where the user has to open and close the file explicitly.
If the operating system knew that a certain application was going
to access file data in a sequential manner, how could it exploit this
information to improve performance?
Give an example of an application that could benefit from operating-
system support for random access to indexed files.
Some systems provide file sharing by maintaining a single copy of a
file. Other systems maintain several copies, one for each of the users
sharing the file. Discuss the relative merits of each approach.
EX-48

