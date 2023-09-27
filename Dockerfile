FROM node:18.16.1
RUN apt-get update
RUN apt-get install libnss3 -y
RUN export LD_LIBRARY_PATH="$(find / -name "libnss3.so" 2>/dev/null | xargs dirname | sort -u | tr '\n' ':')$LD_LIBRARY_PATH"
RUN apt-get install libatk1.0-0 -y
RUN apt-get install libatk-bridge2.0-0 -y
RUN apt-get install libcups2 -y
RUN apt-get install libdrm2 -y
RUN apt-get install libxcomposite1 -y
RUN apt-get install libxdamage1 -y
RUN apt-get install libxfixes3 -y
RUN apt-get install libxrandr2 -y
RUN apt-get install libx11-xcb1 libxcomposite1 libasound2 libatk1.0-0 libatk-bridge2.0-0 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 -y

RUN apt-get install fonts-liberation libu2f-udev libvulkan1 xdg-utils -y
# Add the Google Chrome repository
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && dpkg -i google-chrome-stable_current_amd64.deb
# Update the package list
RUN apt-get update

# Install Google Chrome
RUN apt-get install google-chrome-stable -y
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]