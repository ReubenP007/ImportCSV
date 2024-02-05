# ImportCSV
This script is designed to automate the process of importing video clips and creating subclips in Adobe Premiere Pro using a CSV file. It follows these main steps:

1.) File Selection and Reading: The script prompts the user to select a CSV file and then reads its contents. It expects a specific format and structure in the CSV file.

2.) CSV Format Check: It checks if the CSV file has the expected number of columns.

3.) Importing Clips: The script creates a bin named "Original Clips" and imports video clips listed in the CSV file into this bin. It checks if the files exist before importing.

4.) Creating Subclips: A bin named "Subclips" is created for organizing subclips. The script then creates subclips based on time codes specified in the CSV file. These subclips are placed in the "Subclips" bin and then inserted into a sequence named "Auto Seq" with a buffer time between each clip.

5.) Error Handling: The script includes alerts and checks for file existence, invalid timecodes, and other potential issues.

6.) Helper Functions: Functions like findBinIndex, timecodeToSeconds, and placeClip are defined to handle specific tasks such as finding bins, converting timecodes, and placing clips in the sequence.

This script is a comprehensive tool for automating the video editing workflow in Premiere Pro, especially when dealing with a large number of clips that need to be organized and edited based on a predefined structure in a CSV file. It significantly reduces the manual effort involved in such tasks.
