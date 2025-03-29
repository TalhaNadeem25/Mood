const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'public', 'models');
const baseUrl = 'https://justadudewhohacks.github.io/face-api.js/weights';

const files = [
    'tiny_face_detector_model-shard1',
    'tiny_face_detector_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_expression_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'tiny_yolov2_model-shard1',
    'tiny_yolov2_model-weights_manifest.json',
    'tiny_yolov2_separable_conv_model-shard1',
    'tiny_yolov2_separable_conv_model-weights_manifest.json'
];

// Create models directory if it doesn't exist
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

function downloadFile(filename) {
    const file = fs.createWriteStream(path.join(modelsDir, filename));
    const url = `${baseUrl}/${filename}`;
    
    console.log(`Downloading ${filename} from ${url}`);

    return new Promise((resolve, reject) => {
        https.get(url, response => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });

            file.on('error', err => {
                fs.unlink(path.join(modelsDir, filename), () => {});
                reject(err);
            });
        }).on('error', err => {
            fs.unlink(path.join(modelsDir, filename), () => {});
            reject(err);
        });
    });
}

async function downloadAllFiles() {
    try {
        for (const file of files) {
            await downloadFile(file);
        }
        console.log('All files downloaded successfully!');
    } catch (err) {
        console.error('Error downloading files:', err);
        process.exit(1);
    }
}

downloadAllFiles(); 