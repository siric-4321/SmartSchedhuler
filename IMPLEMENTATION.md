IMPLEMENTATION.md
1. Overview

For this milestone (PM4), our team implemented several components of the Smart Scheduler Assistant using AI tools. The code currently provides structural foundations and partial logic for scheduling, event storage, and conflict detection. The implementation is not expected to be fully functional at this stage.

We used AI to accelerate boilerplate creation and to model the architectural structure outlined in PM3.

2. Features Implemented
a. Event class

Stores event title, date, start time, end time, and location

Includes methods:

duration()

conflicts_with(other_event)

__str__()

b. ScheduleManager class

Stores and manages a list of events

Supports:

Adding events

Simple conflict checking

Listing all events

Finding next available time slot

Removing events

c. Demo Script

A basic script (main.py) demonstrates the functionality by creating events, adding them to the schedule, and printing results.

3. AI Tool Usage
AI Tools Used

ChatGPT (GPT-5.1)

How AI Was Used

Generated initial class skeletons

Suggested method names and structure consistent with PM3 design

Produced placeholder, partially incorrect logic (acceptable for PM4)

Generated documentation comments and method stubs

Prompts Used

Examples include:

"Generate a basic Event class for a smart scheduler."

"Write a ScheduleManager class that stores events and checks conflicts."

"Create a simple demo script using Event and ScheduleManager."

"Include AI usage comments in the code."

Why AI Was Used

To quickly generate multi-function code required by the assignment

To match structure with previously designed PM3 UML diagrams

To ensure each team member could commit, edit, and extend code independently

4. Did the AI Output Match Expectations?

The generated code:

Matches intended class structure

Does not fully work (expected for PM4)

Provides a strong starting point for PM5 and the final demo

Required several manual modifications by team members:

Adjusting class attributes

Editing placeholder logic

Renaming methods to match PM3 design

Adding import consistency

5. Modifications Made to AI Code

Team members manually:

Adjusted event time formatting

Improved comments

Organized folder structure

Fixed minor syntax errors

Added/removed methods as needed

All changes were committed individually to show contribution.