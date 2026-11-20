export function initQrModal() {
    const qrModal = document.getElementById('qrModal');
    const qrcodeCanvas = document.getElementById('qrcodeCanvas');
    const qrUrlText = document.getElementById('qrUrlText');

    function openQrCodeModal() {
        const currentUrl = window.location.href.split('?')[0];
        qrUrlText.textContent = currentUrl;
        qrcodeCanvas.innerHTML = '';

        new QRCode(qrcodeCanvas, {
            text: currentUrl,
            width: 200,
            height: 200,
            colorDark: '#1a0f0a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H,
        });

        qrModal.classList.remove('hidden');
    }

    document.getElementById('openQrModalBtn')?.addEventListener('click', openQrCodeModal);
    document.getElementById('showQrPublicBtn')?.addEventListener('click', openQrCodeModal);
    document.getElementById('closeQrModalBtn')?.addEventListener('click', () => qrModal.classList.add('hidden'));
    document.getElementById('closeQrModalBtn2')?.addEventListener('click', () => qrModal.classList.add('hidden'));

    document.getElementById('downloadQrBtn')?.addEventListener('click', () => {
        const img = qrcodeCanvas.querySelector('img');
        const canvas = qrcodeCanvas.querySelector('canvas');
        const imageSrc = img ? img.src : canvas ? canvas.toDataURL('image/png') : null;

        if (imageSrc) {
            const a = document.createElement('a');
            a.href = imageSrc;
            a.download = 'qrcode-congresso-profecia.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
}
