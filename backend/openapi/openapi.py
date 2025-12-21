from pydantic.json_schema import GenerateJsonSchema
from pydantic_core import core_schema


def field_is_required(
    self: GenerateJsonSchema,
    field: core_schema.ModelField | core_schema.DataclassField | core_schema.TypedDictField,
    total: bool,
) -> bool:
    """
    Override the default Pydantic behavior such that we mark all fields as required.
    Otherwise, Pydantic will mark a field as nullable and optional at the same time
    which causes hey-api to type fields as `field?: string | null` which is hard to work with.

    Field can still be typed as `type: ["string", "null"]` to allow for nullable values.

    """
    return True


GenerateJsonSchema.field_is_required = field_is_required  # type: ignore[method-assign]
