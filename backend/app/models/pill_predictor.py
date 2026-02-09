# app/models/pill_predictor.py
import torch
import io
import os
from PIL import Image
from torchvision import transforms
from app.core.config import settings

# ===============================
# 모델 경로
# ===============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "optimized_medicine_model_170.pt")

# ===============================
# 이미지 전처리
# ===============================
transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)

pill_model = None


# ===============================
# 모델 로드 (TorchScript)
# ===============================
def load_model():
    global pill_model

    if pill_model is not None:
        return

    pill_model = torch.jit.load(
        MODEL_PATH,
        map_location=settings.DEVICE,
    )
    pill_model.eval()


# ===============================
# 예측
# ===============================
def predict_pill(image_bytes: bytes):
    if pill_model is None:
        raise RuntimeError("pill_model 이 로드되지 않았습니다")

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(img).unsqueeze(0).to(settings.DEVICE)

    with torch.no_grad():
        output = pill_model(tensor)
        prob = torch.softmax(output, dim=1)
        conf, pred = torch.max(prob, 1)

    confidence = conf.item()
    is_medicine = confidence >= 0.3

    return int(pred), confidence, is_medicine
