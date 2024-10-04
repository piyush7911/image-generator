import React, { useState, useRef, useEffect } from 'react';
import Together from "together-ai";
import './ImageGenerator.css';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clickedImage, setClickedImage] = useState(null); // Track clicked image
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const together = new Together({ apiKey: process.env.REACT_APP_TOGETHER_API_KEY });
      const response = await together.images.create({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: prompt,
        width: 1024,
        height: 768,
        steps: 4,
        n: 1,
        response_format: "b64_json"
      });
      const newImage = {
        id: Date.now(),
        src: `data:image/png;base64,${response.data[0].b64_json}`,
        prompt: prompt
      };
      setImages(prevImages => [newImage, ...prevImages]);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (imageSrc, prompt) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `generated-image-${prompt.substring(0, 20)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullSize = (image) => {
    setClickedImage(image); // Open the full-size image when clicked
  };

  const closeFullSize = () => {
    setClickedImage(null); // Close the full-size view
  };

  return (
    <div className="image-generator">
      <h1>Free Image Generator</h1>
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
        rows={1}
      />
      <button onClick={generateImage} disabled={loading || !prompt.trim()}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      <div className="image-history">
        {images.map((image) => (
          <div key={image.id} className="image-item" onClick={() => openFullSize(image)}>
            <img src={image.src} alt={image.prompt} />
            <p>{image.prompt}</p>
            <button onClick={(e) => { e.stopPropagation(); downloadImage(image.src, image.prompt); }}>
              Download
            </button>
          </div>
        ))}
      </div>

      {/* Full-size image overlay */}
      {clickedImage && (
        <div className="full-size-overlay" onClick={closeFullSize}>
          <div className="full-size-container" onClick={(e) => e.stopPropagation()}>
            <img src={clickedImage.src} alt={clickedImage.prompt} width="1024" height="768" />
            <button className="close-btn" onClick={closeFullSize}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;

