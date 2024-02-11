from __future__ import annotations

from collections import defaultdict
from enum import auto
from functools import cache
from typing import TYPE_CHECKING

from pydantic import BaseModel

from bracket.utils.http import HTTPMethod
from bracket.utils.starlette import get_route_path
from bracket.utils.types import EnumAutoStr

if TYPE_CHECKING:
    from starlette.requests import Request


class PrometheusMetricType(EnumAutoStr):
    counter = auto()
    gauge = auto()
    summary = auto()
    histogram = auto()


class RequestDefinition(BaseModel):
    url: str
    method: HTTPMethod

    @staticmethod
    def from_request(request: Request) -> RequestDefinition:
        return RequestDefinition(
            url=get_route_path(request),
            method=HTTPMethod(request.method),
        )

    def to_value_lookup(self, value: float) -> tuple[dict[str, str], float]:
        return {"url": self.url, "method": self.method.value}, value

    def __hash__(self) -> int:
        return str.__hash__(f"{self.method}-{self.url}")


class MetricDefinition(BaseModel):
    name: str
    description: str
    type_: PrometheusMetricType

    def format_for_prometheus(self, value: float) -> str:
        return (
            f"# HELP {self.name} {self.description}\n"
            f"# TYPE {self.name} {self.type_.value}\n"
            f"{self.name} {value:.06f}\n"
        )

    def format_for_prometheus_per_label(self, values: list[tuple[dict[str, str], float]]) -> str:
        result = f"# HELP {self.name} {self.description}\n# TYPE {self.name} {self.type_.value}\n"
        for labels, value in values:
            key_value = ",".join(
                [f'{label}="{label_value}"' for label, label_value in labels.items()]
            )
            result += f"{self.name}{{{key_value}}} {value}\n"

        return result


METRIC_DEFINITIONS = [
    MetricDefinition(
        name="bracket_response_time",
        description="Latest response time per endpoint",
        type_=PrometheusMetricType.gauge,
    ),
    MetricDefinition(
        name="bracket_request_count",
        description="Requests count per endpoint",
        type_=PrometheusMetricType.counter,
    ),
    MetricDefinition(
        name="bracket_version",
        description="Requests count per endpoint",
        type_=PrometheusMetricType.counter,
    ),
]


class RequestMetrics(BaseModel):
    response_time: dict[RequestDefinition, float] = defaultdict(float)
    request_count: dict[RequestDefinition, int] = defaultdict(int)

    def to_prometheus(self) -> str:
        metrics = [
            METRIC_DEFINITIONS[0].format_for_prometheus_per_label(
                [m.to_value_lookup(v) for m, v in self.response_time.items()]
            ),
            METRIC_DEFINITIONS[1].format_for_prometheus_per_label(
                [m.to_value_lookup(v) for m, v in self.request_count.items()]
            ),
            METRIC_DEFINITIONS[2].format_for_prometheus(1.0),
        ]
        return "\n".join(metrics)


@cache
def get_request_metrics() -> RequestMetrics:
    return RequestMetrics()
