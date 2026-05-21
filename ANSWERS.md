# Answers to Assessment Questions

## 1. How to run

In a local setup just open your IDE and either clone the github repository or download the zipfile.
git clone https://github.com/usertechbuddy/habit-tracker
cd habit-tracker
After opening it in the IDE, open the index.html file in your browser.

## 2. Stack and Design choices

- For the stack I picked the og html/css/js trio because it is the stack i am well versed in.
  It is easier to build and has no dependencies to worry about.

- For the design the noteable choice I made was to go for a horizontal scroll instead of the usual
  vertical that is used in most of these apps. It also helps in making it mobile responsive. Also
  these types of app give a fun styles so I want for this retro game-ish design for my frontend.

## 3. Responsive Behavior and Accessibilty

- 360px phone: Container padding shrinks to 12px, grid columns reduce to 65-80px, habit labels stack vertically (name on top, streak below), navigation buttons stack vertically

- 1440px laptop: Max width container, grid columns expand to 120-140px, comfortable click targets, all days visible without horizontal scroll in most cases

- User can use the tab key to navigate through the buttons and to make them easier to spot them all the buttons have shadows and hover effects.

- I skipped role="grid" and complex screen reader announcements for real-time streak updates.

## 4. AI Usage

-Claude: Asked to apply the "Bauhaus" design to my style.css. I got the style and color scheme I needed but the grid that showed the names of the habits we saved were messed up and instead of showing them horizontally they were showing them vertically so I fixed that using .habit-row.

-GitHub Copilot: Autocompleted the grid rendering function and the week navigation helpers. I changed copilot generated fixed 7-column layout and switched to CSS Grid with minmax().

## 5. Honest Gap

- The renaming habit experience is clunky. Currently it uses a browser prompt() dialog — not ideal for mobile or modern UX.

- With another day I would replace prompt() with an inline editable <input> that appears on click

- Also I would like to add dynamic ui updates.

- Notifications for the streak would also be a feature that I would consider for future work
