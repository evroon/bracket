import logging

from bracket.config import Environment, environment


def create_logger(level: int) -> logging.Logger:
    logFormatter = logging.Formatter(fmt='[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s')

    logger = logging.getLogger('bracket')
    logger.setLevel(level)

    consoleHandler = logging.StreamHandler()
    consoleHandler.setLevel(level)
    consoleHandler.setFormatter(logFormatter)
    logger.addHandler(consoleHandler)

    return logger


logger = create_logger(environment.get_log_level())
logger.info(f'Current env: {environment.value}')
