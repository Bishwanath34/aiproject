from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import pandas as pd
import numpy as np
import pickle

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load models and transformers
model = pickle.load(open("fertilizer_model.pkl", "rb"))
ct = pickle.load(open("column_transformer.pkl", "rb"))
sc = pickle.load(open("scaler.pkl", "rb"))

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    user_input = pd.DataFrame({
        'Temparature': [data['Temperature']],
        'Humidity ': [data['Humidity']],
        'Moisture': [data['Moisture']],
        'Soil Type': [data['Soil_Type']],
        'Crop Type': [data['Crop_Type']],
        'Nitrogen': [data['Nitrogen']],
        'Phosphorous': [data['Phosphorous']],
        'Potassium': [data['Potassium']]
    })

    # Transform and scale input data
    user_input_encoded = np.array(ct.transform(user_input))
    user_input_scaled = sc.transform(user_input_encoded)
    prediction = model.predict(user_input_scaled)

    return jsonify({'Recommended Fertilizer': prediction[0]})

if __name__ == '__main__':
    app.run(debug=True)
