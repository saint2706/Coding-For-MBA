"""Time series forecasting utilities for Day 56."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Dict, Tuple

import numpy as np
import pandas as pd
from numpy.typing import ArrayLike
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX


@dataclass
class ForecastResult:
    """Container for forecast outputs and residual metrics."""

    forecast: pd.Series
    lower: pd.Series | None
    upper: pd.Series | None


def generate_seasonal_series(
    periods: int = 96,
    seasonal_period: int = 12,
    trend: float = 0.3,
    noise: float = 0.5,
    random_state: int = 56,
) -> pd.Series:
    """Return a synthetic seasonal time series suitable for forecasting demos."""

    rng = np.random.default_rng(random_state)
    time = np.arange(periods)
    seasonal_pattern = np.sin(2 * np.pi * time / seasonal_period)
    series = (
        5 + trend * time + 2.5 * seasonal_pattern + rng.normal(0, noise, size=periods)
    )
    index = pd.date_range("2020-01-01", periods=periods, freq="MS")
    return pd.Series(series, index=index, name="demand")


def train_test_split_series(
    series: pd.Series, test_size: int = 12
) -> Tuple[pd.Series, pd.Series]:
    """Split a series into train and test suffixes."""

    if test_size <= 0:
        msg = "test_size must be positive"
        raise ValueError(msg)
    return series.iloc[:-test_size], series.iloc[-test_size:]


def fit_arima_forecast(
    train: pd.Series,
    order: Tuple[int, int, int] = (1, 1, 1),
    steps: int = 12,
) -> ForecastResult:
    """Fit an ARIMA model and forecast the specified number of steps."""

    model = ARIMA(train, order=order)
    fitted = model.fit()
    forecast_res = fitted.get_forecast(steps=steps)
    mean = forecast_res.predicted_mean
    conf_int = forecast_res.conf_int(alpha=0.05)
    return ForecastResult(
        forecast=mean,
        lower=conf_int.iloc[:, 0],
        upper=conf_int.iloc[:, 1],
    )


def fit_sarimax_forecast(
    train: pd.Series,
    order: Tuple[int, int, int] = (1, 0, 0),
    seasonal_order: Tuple[int, int, int, int] = (0, 1, 1, 12),
    steps: int = 12,
) -> ForecastResult:
    """Fit a SARIMAX model that captures seasonal structure."""

    model = SARIMAX(
        train,
        order=order,
        seasonal_order=seasonal_order,
        trend="c",
        enforce_stationarity=False,
        enforce_invertibility=False,
    )
    fitted = model.fit(disp=False)
    forecast_res = fitted.get_forecast(steps=steps)
    mean = forecast_res.predicted_mean
    conf_int = forecast_res.conf_int(alpha=0.05)
    return ForecastResult(
        forecast=mean,
        lower=conf_int.iloc[:, 0],
        upper=conf_int.iloc[:, 1],
    )


def fit_exponential_smoothing(
    train: pd.Series,
    seasonal_periods: int = 12,
    trend: str = "add",
    seasonal: str = "add",
    steps: int = 12,
) -> ForecastResult:
    """Fit Holt-Winters exponential smoothing and forecast."""

    model = ExponentialSmoothing(
        train,
        seasonal_periods=seasonal_periods,
        trend=trend,
        seasonal=seasonal,
    )
    fitted = model.fit(optimized=True)
    forecast = fitted.forecast(steps)
    return ForecastResult(forecast=forecast, lower=None, upper=None)


def forecast_metrics(y_true: ArrayLike, y_pred: ArrayLike) -> Dict[str, float]:
    """Return common time-series error metrics."""

    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    mae = np.mean(np.abs(y_true - y_pred))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    with np.errstate(divide="ignore", invalid="ignore"):
        mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
        smape = 100 * np.mean(
            np.abs(y_true - y_pred) / ((np.abs(y_true) + np.abs(y_pred)) / 2)
        )
    return {
        "mae": float(mae),
        "rmse": rmse,
        "mape": float(np.nan_to_num(mape)),
        "smape": float(np.nan_to_num(smape)),
    }


def rolling_origin_backtest(
    series: pd.Series,
    initial_train_size: int,
    horizon: int,
    model_builder: Callable[[pd.Series, int], ForecastResult],
) -> pd.DataFrame:
    """Perform a rolling-origin backtest returning metrics per split."""

    if initial_train_size + horizon > len(series):
        msg = "Not enough observations for the specified horizon."
        raise ValueError(msg)
    rows = []
    for start in range(len(series) - initial_train_size - horizon + 1):
        train_end = initial_train_size + start
        train = series.iloc[:train_end]
        test = series.iloc[train_end : train_end + horizon]
        forecast = model_builder(train, horizon)
        metrics = forecast_metrics(test.values, forecast.forecast.values)
        metrics["start"] = series.index[train_end]
        rows.append(metrics)
    return pd.DataFrame(rows)


def prophet_style_forecast(train: pd.Series, steps: int = 12) -> ForecastResult:
    """Approximate a Prophet-like decomposition using statsmodels."""

    # Prophet combines trend and seasonality; emulate with additive Holt-Winters
    result = fit_exponential_smoothing(
        train, seasonal_periods=12, trend="add", seasonal="add", steps=steps
    )
    return result


def demo_forecasting_pipeline(random_state: int = 56) -> Dict[str, float]:
    """Generate a dataset, fit multiple models, and return evaluation metrics."""

    series = generate_seasonal_series(random_state=random_state)
    train, test = train_test_split_series(series, test_size=12)

    arima_forecast = fit_arima_forecast(train, steps=len(test))
    sarimax_forecast = fit_sarimax_forecast(train, steps=len(test))
    prophet_like = prophet_style_forecast(train, steps=len(test))

    arima_metrics = forecast_metrics(test.values, arima_forecast.forecast.values)
    sarimax_metrics = forecast_metrics(test.values, sarimax_forecast.forecast.values)
    prophet_metrics = forecast_metrics(test.values, prophet_like.forecast.values)

    return {
        "arima_mae": arima_metrics["mae"],
        "sarimax_mae": sarimax_metrics["mae"],
        "prophet_mae": prophet_metrics["mae"],
        "test_mean": float(test.mean()),
    }


if __name__ == "__main__":
    summary = demo_forecasting_pipeline()
    for key, value in summary.items():
        print(f"{key}: {value:.3f}")
