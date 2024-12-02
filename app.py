import json
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Path to the JSON file that contains the user data
JSON_FILE_PATH = 'data/users.json'


# Function to load data from the JSON file
def load_data():
    try:
        with open(JSON_FILE_PATH, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return []  # Return empty list if file doesn't exist
    except json.JSONDecodeError:
        return []  # Return empty list if file contains invalid JSON


# Function to save data to the JSON file
def save_data(data):
    with open(JSON_FILE_PATH, 'w') as file:
        json.dump(data, file, indent=4)


@app.route('/')
def index():
    # Render the main HTML page
    return render_template('index.html')


@app.route('/api/users', methods=['GET'])
def get_users():
    # Get user data from JSON file
    users = load_data()
    return jsonify(users)


@app.route('/api/users', methods=['POST'])
def add_user():
    # Add a new user to the data
    new_user = request.get_json()  # Get user data sent from the client
    users = load_data()  # Load the current users from the JSON file
    users.append(new_user)  # Append the new user
    save_data(users)  # Save the updated users back to the JSON file
    return jsonify(new_user), 201  # Return the added user as a response



@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    # Update a user based on their ID
    updated_user = request.get_json()
    users = load_data()
    for idx, user in enumerate(users):
        if user['id'] == user_id:
            users[idx] = updated_user
            save_data(users)
            return jsonify(updated_user)
    return jsonify({"error": "User not found"}), 404


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    with open('data/users.json', 'r') as file:
        users = json.load(file)

    # Remove the user with the given ID
    users = [user for user in users if user['id'] != user_id]

    # Reassign IDs sequentially
    for index, user in enumerate(users):
        user['id'] = index + 1

    # Save the updated list back to the file
    with open('data/users.json', 'w') as file:
        json.dump(users, file)

    return jsonify({'message': 'User deleted successfully'}), 200



if __name__ == '__main__':
    app.run(debug=True)