from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseSchema):
    status: str
    app_name: str
    version: str
    environment: str


class DatabaseHealthResponse(BaseSchema):
    status: str
    database: str
    connection: str


class MessageResponse(BaseSchema):
    message: str
    detail: str | None = None
