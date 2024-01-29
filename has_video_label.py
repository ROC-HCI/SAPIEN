import json
import os
import json

# Specify the path to your JSON file
file_path = "start_app/static/sapien-data/sapien_data.json"

# Load the JSON file into a variable
with open(file_path) as file:
    sapien_data = json.load(file)["SAPIEN"]
    # Specify the folder paths
    speak_path = "start_app/static/video/speak"
    static_path = "start_app/static/video/static"

    # Get the list of filenames in the folders
    speak_filenames = set(os.listdir(speak_path))
    static_filenames = set(os.listdir(static_path))

    # Remove the last 4 characters from each filename and store in sets
    modified_speak_filenames = {filename[:-4] for filename in speak_filenames}
    modified_static_filenames = {filename[:-4] for filename in static_filenames}

    # Take the intersection of the two sets
    modified_filenames = modified_speak_filenames.intersection(modified_static_filenames)

    # Add "has_video" attribute to each human
    for human in sapien_data:
        first_name = human["First Name"]
        if first_name in modified_filenames:
            human["has_video"] = True
        else:
            human["has_video"] = False

    # Print the modified sapien_data
    # Print the modified sapien_data with pretty formatting
    print(json.dumps(sapien_data, indent=4))

    # Specify the path to save the new JSON file
    save_path = "sapien_data_labeled.json"

    # Create a dictionary object with the labeled sapien_data
    labeled_data = {"SAPIEN": sapien_data}

    # Save the labeled_data to a new JSON file
    with open(save_path, "w") as file:
        json.dump(labeled_data, file, indent=4)

    



