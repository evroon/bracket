import logging

from bracket.config import environment


def create_logger(level: int) -> logging.Logger:
    log_formatter = logging.Formatter(fmt="[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s")

    logger = logging.getLogger("bracket")  # pylint: disable=redefined-outer-name
    logger.setLevel(level)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(log_formatter)
    logger.addHandler(console_handler)

    return logger


logger = create_logger(environment.get_log_level())
logger.info("Current env: %s", environment.value)
