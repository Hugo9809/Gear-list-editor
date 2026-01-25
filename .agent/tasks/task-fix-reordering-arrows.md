# Task: Fix Reordering Arrows in Gear List

## Status: Complete

## User Request
"the reordering arrows of the gear list items does not work"

## Diagnosis
The `moveItemUp` and `moveItemDown` functions were not being passed from `App.jsx` to the project workspace components.

## Resolution
Updated `App.jsx` to destructure these functions from `useProjects` and include them in the `projectActions` object.
