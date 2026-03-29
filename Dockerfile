FROM python:3.14-slim

WORKDIR /app

COPY . /app

RUN apt-get -y ffmpeg
RUN pip install -r requirements.txt

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
