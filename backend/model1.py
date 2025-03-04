from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import train_test_split, TimeSeriesSplit, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import RobustScaler, PowerTransformer
from sklearn.impute import KNNImputer
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_squared_error, r2_score, make_scorer

app = Flask(__name__)
CORS(app)
PORT = 5001  # New port number

# Load dataset
df = pd.read_csv(r"C:\Users\Hp\Documents\ansh proj\project\backend\Assets\final_data1.csv", parse_dates=['Date'], dayfirst=True)

# Feature engineering
df['WindDirection_sin'] = np.sin(np.radians(df['Wind Direction at 2 Meters (Degrees)']))
df['WindDirection_cos'] = np.cos(np.radians(df['Wind Direction at 2 Meters (Degrees)']))

target_variables = ['Temperature at 2 meters (c)', 'Precipitation Corrected (mm/day)', 'Wind Speed at 2 Meters (m/s)']
features = [col for col in df.columns if col not in target_variables + ['Date']]

df.dropna(inplace=True)
df.drop('Date', axis=1, inplace=True)

# Train models
models = {}
r2_scores = {}
mse_scores = {}
rmse_scorer = make_scorer(lambda y_true, y_pred: np.sqrt(mean_squared_error(y_true, y_pred)), greater_is_better=False)

for target in target_variables:
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    pipeline = Pipeline([
        ('scaler', RobustScaler()),
        ('model', LGBMRegressor(random_state=42))
    ])
    
    ts_cv = TimeSeriesSplit(n_splits=5)
    cross_val_score(pipeline, X_train, y_train, cv=ts_cv, scoring=rmse_scorer)
    
    pipeline.fit(X_train, y_train)
    y_pred_test = pipeline.predict(X_test)
    
    r2_scores[target] = r2_score(y_test, y_pred_test)
    mse_scores[target] = mean_squared_error(y_test, y_pred_test)
    models[target] = pipeline

@app.route('/predict_weather', methods=['GET'])
def predict_weather():
    date_str = request.args.get('date')
    try:
        input_date = datetime.strptime(date_str, '%d/%m/%Y')
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use DD/MM/YYYY'}), 400

    input_data = pd.DataFrame({
        'Year': [input_date.year], 'Month': [input_date.month], 'Day': [input_date.day],
        'DayOfYear': [input_date.timetuple().tm_yday], 'WeekOfYear': [input_date.isocalendar().week]
    })

    input_data['DayOfYear_sin'] = np.sin(2 * np.pi * input_data['DayOfYear'] / 365.25)
    input_data['DayOfYear_cos'] = np.cos(2 * np.pi * input_data['DayOfYear'] / 365.25)
    input_data['WeekOfYear_sin'] = np.sin(2 * np.pi * input_data['WeekOfYear'] / 52)
    input_data['WeekOfYear_cos'] = np.cos(2 * np.pi * input_data['WeekOfYear'] / 52)

    input_data['Wind Direction at 2 Meters (Degrees)'] = df['Wind Direction at 2 Meters (Degrees)'].mean()
    input_data['WindDirection_sin'] = np.sin(np.radians(input_data['Wind Direction at 2 Meters (Degrees)']))
    input_data['WindDirection_cos'] = np.cos(np.radians(input_data['Wind Direction at 2 Meters (Degrees)']))

    for col in features:
        if col not in input_data.columns:
            input_data[col] = df[col].mean()

    input_data = input_data[features]
    predictions = {target: models[target].predict(input_data)[0] for target in target_variables}

    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True, port=PORT)
