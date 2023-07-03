import json
import numpy as np
import pandas as pd
import pickle
import os
from collections import Counter
from django.http import JsonResponse
from django.contrib.auth.models import User, auth
from io import StringIO
from keras.models import Sequential, load_model
from keras.layers import LSTM, Dense
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from threading import Thread
from time import sleep
from .models import Test, KeyStroke

MODEL_PATH = "./model/model.h5"
LABEL_ENCODER_PATH = "./model/label_encoder.pkl"

if os.path.exists(MODEL_PATH):
    global_model = load_model(MODEL_PATH)
    with open(LABEL_ENCODER_PATH, 'rb') as file:
        global_label_encoder = pickle.load(file)
else:
    global_model = None
    global_label_encoder = None


def signup(request):
    if request.method == 'POST':
        json_data = json.loads(request.body)

        if 'username' not in json_data or \
                'email' not in json_data or \
                'password' not in json_data or \
                'firstName' not in json_data or \
                'lastName' not in json_data:
            return JsonResponse({
                "status": 400,
                "data": "Missing required fields"
            })

        username = json_data['username']
        email = json_data['email']
        password = json_data['password']
        first_name = json_data['firstName']
        last_name = json_data['lastName']

        if User.objects.filter(username=username):
            return JsonResponse({
                "status": 400,
                "data": "Username already exists! Please try some other username",
            })

        if User.objects.filter(email=email):
            return JsonResponse({
                "status": 400,
                "data": "Email already registered!",
            })

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        return JsonResponse({
            "status": 200,
            "data": "User created successfully"
        })

    return JsonResponse({
        "status": 400,
        "data": "Expected POST request"
    })


def signin(request):
    if request.method == 'POST':
        json_data = json.loads(request.body)

        if 'username' not in json_data or \
                'password' not in json_data:
            return JsonResponse({
                "status": 400,
                "data": "Missing required fields"
            })

        username = json_data['username']
        password = json_data['password']

        if User.objects.filter(username=username) == None:
            return JsonResponse({
                "status": 400,
                "data": "Username not present",
            })

        user = auth.authenticate(username=username, password=password)
        if user == None:
            return JsonResponse({
                "status": 400,
                "data": "User not found"
            })
        auth.login(request, user)

        return JsonResponse({
            "status": 200,
            "data": "Logged in successfully",
            "username": user.username,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
        })

    return JsonResponse({
        "status": 400,
        "data": "Expected POST request"
    })


def signout(request):
    auth.logout(request)
    return JsonResponse({
        "status": 200,
        "data": "Logged out successfully"
    })


def isAuth(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "status": 200,
            "data": "Logged in successfully",
            "username": request.user.username,
            "email": request.user.email,
            "firstName": request.user.first_name,
            "lastName": request.user.last_name,
        })
    return JsonResponse({
        "status": 401,
        "data": "Not logged in",
    })


def trainModel():
    data = []
    for test in Test.objects.all():
        keystrokes = KeyStroke.objects.filter(testId=test)
        for i in range(len(keystrokes)):
            data.append([
                keystrokes[i].key,
                keystrokes[i].dwellTime,
                keystrokes[i].flightTime,
                keystrokes[i].interKeyLatency,
                test.userId.id,
            ])

    data = pd.DataFrame(
        np.array(data),
        columns=['key', 'dwell_time', 'flight_time', 'inter_key_latency', 'user_identity'],
    )

    # Separate features (key, dwell time, flight time, inter-key latency) and labels (user identity)
    features = data[['key', 'dwell_time', 'flight_time', 'inter_key_latency']]
    labels = data['user_identity']

    # Create a sequence length for each user (assuming a fixed sequence length)
    sequence_length = 10

    # Group the features and labels by user identity
    grouped_features = features.groupby(labels)
    grouped_labels = labels.groupby(labels)

    # Initialize the lists to store the sequences and corresponding labels
    sequences = []
    auth_labels = []

    # Generate sequences and labels for each user
    for user, group in grouped_features:
        user_features = group[['key', 'dwell_time', 'flight_time', 'inter_key_latency']].values
        user_labels = grouped_labels.get_group(user).values
        for i in range(len(user_features) - sequence_length):
            sequences.append(user_features[i: i + sequence_length])
            auth_labels.append(user_labels[i + sequence_length])

    # Convert sequences and labels to numpy arrays
    sequences = np.array(sequences)
    auth_labels = np.array(auth_labels)

    # Convert labels to numerical format
    label_encoder = LabelEncoder()
    auth_labels_encoded = label_encoder.fit_transform(auth_labels)

    # Scale the features for better model performance
    scaler = StandardScaler()
    sequences_scaled = scaler.fit_transform(sequences.reshape(-1, sequences.shape[-1])).reshape(sequences.shape)

    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(sequences_scaled, auth_labels_encoded, test_size=0.01, random_state=42)

    # Define the model architecture (LSTM)
    model = Sequential()
    model.add(LSTM(256, activation='relu', input_shape=(sequence_length, 4), return_sequences=True))
    model.add(LSTM(128, activation='relu', return_sequences=True))
    model.add(LSTM(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(len(label_encoder.classes_), activation='softmax'))

    # Compile the model
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

    # Train the model
    model.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test))

    # Save the model to an h5 file
    model.save(MODEL_PATH)
    with open(LABEL_ENCODER_PATH, 'wb') as file:
        pickle.dump(label_encoder, file)

    global global_model, global_label_encoder
    global_model = model
    global_label_encoder = label_encoder


def runModel():
    thread1 = Thread(target=trainModel, daemon=True)
    thread1.start()


def trainTest(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "status": 400,
            "data": "Please authenticate first",
        })

    if request.method == 'POST':
        json_data = json.loads(request.body)

        if 'q1Keystrokes' not in json_data or \
                'q2Keystrokes' not in json_data:
            return JsonResponse({
                "status": 400,
                "data": "Missing required fields",
            })

        q1Keystrokes = json_data['q1Keystrokes']
        q2Keystrokes = json_data['q2Keystrokes']

        test = Test.objects.create(
            userId=request.user,
        )

        keyStrokes = []
        for i in range(len(q1Keystrokes[:-1])):
            uptime = q1Keystrokes[i]['upTime']
            downtime = q1Keystrokes[i]['downTime']
            nextDowntime = q1Keystrokes[i + 1]['downTime']

            keyStrokes.append(KeyStroke(
                testId=test,
                key=q1Keystrokes[i]['key'],
                dwellTime=uptime - downtime,
                flightTime=abs(nextDowntime - uptime),
                interKeyLatency=abs(nextDowntime - downtime),
            ))

        for i in range(len(q2Keystrokes[:-1])):
            uptime = q2Keystrokes[i]['upTime']
            downtime = q2Keystrokes[i]['downTime']
            nextDowntime = q2Keystrokes[i + 1]['downTime']

            keyStrokes.append(KeyStroke(
                testId=test,
                key=q2Keystrokes[i]['key'],
                dwellTime=uptime - downtime,
                flightTime=abs(nextDowntime - uptime),
                interKeyLatency=abs(nextDowntime - downtime),
            ))

        KeyStroke.objects.bulk_create(keyStrokes)

        runModel()
        return JsonResponse({
            "status": 200,
            "data": "Submitted successfully",
        })

    return JsonResponse({
        "status": 400,
        "data": "Expected POST request",
    })


def trainTestUpload(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "status": 400,
            "data": "Please authenticate first",
        })

    if request.method == 'POST':
        json_data = json.loads(request.body)

        if 'keyStrokes' not in json_data:
            return JsonResponse({
                "status": 400,
                "data": "Missing required fields",
            })

        test = Test.objects.create(
            userId=request.user,
        )

        keystrokes_json = json_data['keyStrokes']
        keystrokes_csv = pd.read_csv(StringIO(keystrokes_json))
        keyStrokes = []
        for index, row in keystrokes_csv.iterrows():
            keyStrokes.append(KeyStroke(
                testId=test,
                key=row['key'],
                dwellTime=row['dwell_time'],
                flightTime=row['flight_time'],
                interKeyLatency=row['inter_key_latency'],
            ))
        KeyStroke.objects.bulk_create(keyStrokes)

        runModel()
        return JsonResponse({
            "status": 200,
            "data": "Submitted successfully",
        })

    return JsonResponse({
        "status": 400,
        "data": "Expected POST request"
    })


def trainTestResult(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "status": 400,
            "data": "Please authenticate first",
        })

    results = Test.objects.filter(userId=request.user).order_by('-id')
    resultsArray = []
    for result in results:
        resultsArray.append({
            "id": result.id,
            "date": result.time.strftime('%Y-%m-%d %H:%M'),
            "status": "Uploaded successfully",
        })

    return JsonResponse({
        "status": 200,
        "result": resultsArray,
        "data": "Fetched Successfully",
    })


def testResult(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "status": 400,
            "data": "Please authenticate first",
        })

    if request.method == 'POST':
        json_data = json.loads(request.body)

        if 'questionKeystrokes' not in json_data:
            return JsonResponse({
                "status": 400,
                "data": "Missing required fields",
            })

        global global_model, global_label_encoder

        if global_model is None or global_label_encoder is None:
            return JsonResponse({
                "status": 400,
                "data": "Model not trained yet",
            })

        questionKeystrokes = json_data['questionKeystrokes']
        data = []
        for i in range(len(questionKeystrokes[:-1])):
            uptime = questionKeystrokes[i]['upTime']
            downtime = questionKeystrokes[i]['downTime']
            nextDowntime = questionKeystrokes[i + 1]['downTime']

            data.append([
                questionKeystrokes[i]['key'],
                uptime - downtime,
                abs(nextDowntime - uptime),
                abs(nextDowntime - downtime),
            ])

        data = pd.DataFrame(
            np.array(data),
            columns=['key', 'dwell_time', 'flight_time', 'inter_key_latency'],
        )

        # Preprocess the test data
        test_features = data[['key', 'dwell_time', 'flight_time', 'inter_key_latency']]

        scaler = StandardScaler()
        test_features_scaled = scaler.fit_transform(test_features)

        while len(test_features_scaled) % 10 != 0:
            test_features_scaled = np.append(test_features_scaled, [[0, 0, 0, 0]], axis=0)

        lenData = len(test_features_scaled)
        test_features_scaled = test_features_scaled.reshape(int(lenData / 10), 10, 4)

        # Make predictions using the model
        predictions = global_model.predict(test_features_scaled)
        # Convert predictions to class labels
        predicted_labels = global_label_encoder.inverse_transform(np.argmax(predictions, axis=1)).tolist()

        predicted_labels_count = predicted_labels.count(request.user.id)
        percentage = (predicted_labels_count / len(predicted_labels)) * 100

        return JsonResponse({
            "status": 200,
            "data": "Submitted successfully",
            "result": "The is the current user with confidence of " + str(percentage) + "%",
        })

    return JsonResponse({
        "status": 400,
        "data": "Expected POST request",
    })


def testResultUpload(request):
    if not request.user.is_authenticated:
        return JsonResponse({
            "status": 400,
            "data": "Please authenticate first",
        })

    if request.method == 'POST':
        json_data = json.loads(request.body)

        if 'questionKeystrokes' not in json_data:
            return JsonResponse({
                "status": 400,
                "data": "Missing required fields",
            })

        global global_model, global_label_encoder

        if global_model is None or global_label_encoder is None:
            return JsonResponse({
                "status": 400,
                "data": "Model not trained yet",
            })

        questionKeystrokes_json = json_data['questionKeystrokes']
        questionKeystrokes_csv = pd.read_csv(StringIO(questionKeystrokes_json))

        # Preprocess the test data
        test_features = questionKeystrokes_csv[['key', 'dwell_time', 'flight_time', 'inter_key_latency']]

        scaler = StandardScaler()
        test_features_scaled = scaler.fit_transform(test_features)

        while len(test_features_scaled) % 10 != 0:
            test_features_scaled = np.append(test_features_scaled, [[0, 0, 0, 0]], axis=0)

        lenData = len(test_features_scaled)
        test_features_scaled = test_features_scaled.reshape(int(lenData / 10), 10, 4)

        # Make predictions using the model
        predictions = global_model.predict(test_features_scaled)
        # Convert predictions to class labels
        predicted_labels = global_label_encoder.inverse_transform(np.argmax(predictions, axis=1)).tolist()

        predicted_labels_count = predicted_labels.count(request.user.id)
        percentage = (predicted_labels_count / len(predicted_labels)) * 100

        return JsonResponse({
            "status": 200,
            "data": "Submitted successfully",
            "result": "The is the current user with confidence of " + str(percentage) + "%",
        })

    return JsonResponse({
        "status": 400,
        "data": "Expected POST request"
    })
