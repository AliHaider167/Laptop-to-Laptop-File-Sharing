from flask import Flask, send_file, jsonify, request, redirect, url_for, render_template
from flask_socketio import SocketIO, emit
from cryptography.fernet import Fernet
from flask_cors import CORS
import os
import io
from flask import Flask, jsonify
import socket
import subprocess
import platform
import ipaddress
# Enable CORS for the API route


app = Flask(__name__, static_folder='frontend/static', template_folder='frontend/HTML')

CORS(app, resources={r"/scan_network": {"origins": "*"}})

# Encryption key
ENCRYPTION_KEY_PATH = 'encryption_key.key'

# Load or generate encryption key
if os.path.exists(ENCRYPTION_KEY_PATH):
    with open(ENCRYPTION_KEY_PATH, 'rb') as key_file:
        encryption_key = key_file.read()
else:
    encryption_key = Fernet.generate_key()
    with open(ENCRYPTION_KEY_PATH, 'wb') as key_file:
        key_file.write(encryption_key)

cipher = Fernet(encryption_key)


#------------------------------- Get The IP Address of All Local Area Networks ------------------

def get_local_ip():
    """
    Get the local IP address of the current device
    """
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    return local_ip

def ping_ip(ip):
    """
    Ping an IP address and check if it is reachable.
    """
    param = '-n' if platform.system().lower() == 'windows' else '-c'
    command = ['ping', param, '1', ip]
    return subprocess.call(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0

def get_all_devices_in_subnet():
    """
    Scan the local network and return a list of IP addresses of the first 10 devices connected.
    """
    devices = []
    local_ip = get_local_ip()
    print(f"Scanning network for active IPs, starting from local IP: {local_ip}")
    
    # Get network address from local IP (assuming a /24 subnet)
    network = ipaddress.IPv4Network(local_ip + '/24', strict=False)
    
    for ip in network:
        ip = str(ip)
        if ip != local_ip:  # Skip the local IP address itself
            if ping_ip(ip):
                devices.append(ip)
                
                # Stop scanning after finding 10 devices
                if len(devices) >= 10:
                    break
    
    return devices

  

#API to get IPs

@app.route('/scan_network', methods=['GET'])
def scan_network():
    devices = get_all_devices_in_subnet() 

    if devices:
        # Return the whole list of devices
        return jsonify({'active_ips': devices}), 200
    else:
        return jsonify({'error': 'No devices found on the network'}), 404


# File storage
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'docx', 'mp4', 'rar'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB





users = [
  {'username': 'user1', 'password': 'pass123'},
  {'username': 'user2', 'password': 'pass234'}
]




# Route to serve the frontend file
@app.route('/')
def serve_frontend():
    return render_template('index.html')  # Ensure this file is in the same directory as app.py


@app.route('/signup')
def signup_Page():
    return render_template('signup.html') 





@app.route('/login', methods=['GET'])
def logIn():
    """
    Handle user login by validating credentials sent as query parameters.
    Returns a JSON response indicating success or failure.
    """
    # Extract username and password from query parameters
    username = request.args.get('username')
    password = request.args.get('password')

    # Validate input
    for user in users:
        if user['username'] == username and user['password'] == password:
            return jsonify({
            "message": "Login successful",
            "status": "success",
            "redirect_url": "/home"
            }), 200

    

    # Invalid credentials
    return jsonify({
        "message": "Invalid username or password",
        "status": "failure"
    }), 401





@app.route('/home', methods=['GET'])
def homePage():
    return render_template('home.html')



def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part in the request'}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({'error': 'No files uploaded'}), 400
    
    for file in files:
        print("Name: ", file.filename)

    uploaded_files = []
    for file in files:
        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type: {file.filename}'}), 400

        file.seek(0)  # Reset file pointer for size validation
        if len(file.read()) > MAX_FILE_SIZE:
            return jsonify({'error': f'File size exceeds the limit: {file.filename}'}), 400

        file.seek(0)  # Reset file pointer for encryption
        file_name = file.filename
        file_path = os.path.join(UPLOAD_FOLDER, file_name)

        try:
            # Encrypt and save the file
            with open(file_path, 'wb') as encrypted_file:
                encrypted_file.write(cipher.encrypt(file.read()))
            uploaded_files.append(file_name)
        except Exception as e:
            return jsonify({'error': f'File upload failed: {str(e)}'}), 500

    return jsonify({'message': 'Files uploaded and encrypted successfully', 'uploaded_files': uploaded_files})




@app.route('/list_files', methods=['GET'])
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    return jsonify({'files': files})




@app.route('/download/<file_name>', methods=['GET'])
def download_file(file_name):
    file_path = os.path.join(UPLOAD_FOLDER, file_name)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404

    try:
        # Decrypt file in-memory
        with open(file_path, 'rb') as encrypted_file:
            encrypted_data = encrypted_file.read()
        decrypted_data = cipher.decrypt(encrypted_data)

        # Create an in-memory buffer for the decrypted data
        decrypted_file = io.BytesIO(decrypted_data)
        decrypted_file.seek(0)  # Reset the pointer to the start of the buffer

        return send_file(
            decrypted_file,
            as_attachment=True,
            download_name=f"decrypted_{file_name}",
            mimetype='application/octet-stream'
        )
    except Exception as e:
        return jsonify({'error': f'Error during file decryption: {str(e)}'}), 500






@app.route('/addUser', methods=['POST'])
def signUp():
    # Check if the incoming request is JSON
    if request.is_json:
        received_data = request.get_json()  # Parse the JSON data from the request
        print("Received data:", received_data)  # Debug: print received data

        # Extract username and password
        comingUsername = received_data.get('username')
        comingPassword = received_data.get('password')

        user = {
            'username': comingUsername,
            'password': comingPassword
        }

        users.append(user)
        
        for user in users:
            print(f"username = {user['username']}, password = {user['password']}")


        return redirect(url_for('serve_frontend'))

    
    else:
        # If the request is not JSON
        return jsonify({"error": "Invalid content type, expected JSON"}), 400


# Run the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
