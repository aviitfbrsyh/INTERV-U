# Setelah edit file
git add .
git commit -m "pesan perubahan"
git push

# Untuk pull dari GitHub ke komputer lain
git pull

# Clone di komputer baru
git clone https://github.com/aviitfbrsyh/INTERV-U.git
cd INTERV-U
npm install         # install dependencies
# buat .env.local dengan API key kamu
npm run dev
