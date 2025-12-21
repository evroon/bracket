from pydantic.json_schema import GenerateJsonSchema
from pydantic_core import core_schema


def field_is_required(
    self: GenerateJsonSchema,
    field: core_schema.ModelField | core_schema.DataclassField | core_schema.TypedDictField,
    total: bool,
) -> bool:
    return True


GenerateJsonSchema.field_is_required = field_is_required  # type: ignore[method-assign]
