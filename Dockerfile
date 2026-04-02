FROM python:3.14-slim

RUN apt-get update && apt-get upgrade
RUN apt-get install -y ffmpeg

WORKDIR /app

COPY . /app

RUN pip install -r requirements.txt

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--timeout", "600", "app:app"]
