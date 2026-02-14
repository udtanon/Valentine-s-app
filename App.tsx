import React, { useState, useRef } from 'react';
import FloatingHearts from './components/FloatingHearts';
import { Screen } from './types';
import { generateMagicFlower, generateBouquet, generateComicStrip } from './services/geminiService';

// Note: If you have a specific photo of yourself, you can paste the base64 string here.
// Otherwise, the AI will use a descriptive character for the guy.
const MY_PHOTO_BASE64: string | null = null; 

const REAL_FLOWERS = ['Rose', 'Tulip', 'Peony', 'Lily', 'Daisy', 'Sunflower', 'Orchid'];
const COLORS = ['Crimson Red', 'Soft Pink', 'Pure White', 'Golden Yellow', 'Lavender Purple', 'Peach'];

const ShuffleSelector: React.FC<{ 
  options: string[], 
  current: string, 
  onChange: (val: string) => void,
  label: string
}> = ({ options, current, onChange, label }) => {
  const currentIndex = options.indexOf(current);

  const next = () => {
    const nextIdx = (currentIndex + 1) % options.length;
    onChange(options[nextIdx]);
  };

  const prev = () => {
    const prevIdx = (currentIndex - 1 + options.length) % options.length;
    onChange(options[prevIdx]);
  };

  return (
    <div className="space-y-3 w-full">
      <label className="block text-center text-xs font-bold text-rose-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center justify-between bg-white/80 border-2 border-rose-100 rounded-2xl p-2 shadow-sm">
        <button 
          onClick={prev}
          className="w-12 h-12 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors text-2xl font-bold"
        >
          ‹
        </button>
        <div className="flex-1 text-center text-xl font-serif text-rose-700 font-bold animate-fade-in key={current}">
          {current}
        </div>
        <button 
          onClick={next}
          className="w-12 h-12 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors text-2xl font-bold"
        >
          ›
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [flowerImage, setFlowerImage] = useState<string | null>(null);
  const [bouquetImage, setBouquetImage] = useState<string | null>(null);
  const [comicImage, setComicImage] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [guyPhoto, setGuyPhoto] = useState<string | null>(null);
  
  const [userName, setUserName] = useState('');
  const [selectedFlower, setSelectedFlower] = useState('Rose');
  const [selectedColor, setSelectedColor] = useState('Crimson Red');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const guyFileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => setCurrentScreen('journey');

  const handleGenerateSingle = async () => {
    if (!userName.trim()) return;
    setIsGenerating(true);
    setLoadingMessage("Creating a magical surprise...");
    try {
      const img = await generateMagicFlower(selectedFlower, selectedColor);
      setFlowerImage(img);
      setCurrentScreen('flower_result');
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Let's try again!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBouquet = async () => {
    setIsGenerating(true);
    setLoadingMessage(`Perfecting your gift...`);
    try {
      const img = await generateBouquet(selectedFlower, selectedColor, userName);
      setBouquetImage(img);
      setCurrentScreen('bouquet_result');
    } catch (error) {
      console.error(error);
      alert("The florist is busy. Let's try once more!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateComic = async () => {
    if (!userPhoto) return;
    setIsGenerating(true);
    setLoadingMessage("Drawing our story into a comic...");
    try {
      const img = await generateComicStrip(userPhoto, guyPhoto || MY_PHOTO_BASE64, selectedFlower, selectedColor);
      setComicImage(img);
      setCurrentScreen('comic_result');
    } catch (error) {
      console.error(error);
      alert("The artist needs a break. Let's try generating again!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuyPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!comicImage) return;

    // Helper to convert base64 to File for sharing
    const base64ToFile = (base64: string, filename: string) => {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    };

    const file = base64ToFile(comicImage, 'valentine_comic.png');

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Our Dreamy Valentine's Proposal",
          text: `Look at this beautiful comic that was generated for us! Happy Valentine's Day! ❤️`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Download
      const link = document.createElement('a');
      link.href = comicImage;
      link.download = 'valentine_comic.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Sharing isn't supported on this device, so we've downloaded the comic for you instead! ❤️");
    }
  };

  const isNameEmpty = !userName.trim();

  return (
    <div className="min-h-screen w-full relative bg-rose-50 flex flex-col items-center justify-center overflow-x-hidden p-4">
      <FloatingHearts />
      
      <main className="relative z-10 w-full max-w-2xl bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden min-h-[650px] flex flex-col transition-all duration-500">
        {/* Progress Bar */}
        <div className="h-1.5 bg-rose-100 w-full">
           <div 
             className="h-full bg-rose-500 transition-all duration-1000 ease-out" 
             style={{ width: `${(Object.keys({welcome:0, journey:14, flower_result:28, bouquet_result:42, final:56, upload_picture:70, comic_result:100}) as any)[currentScreen]}%` }}
           />
        </div>

        {currentScreen === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-fade-in">
            <div className="text-7xl mb-2 animate-bounce">💌</div>
            <h1 className="text-6xl font-romantic text-rose-600 font-bold">Valentine's Magic</h1>
            <p className="text-xl text-rose-800 font-serif italic max-w-md leading-relaxed">
              "Every flower blooms in its own time, but my love for you blooms always."
            </p>
            <button 
              onClick={handleStart}
              className="mt-4 px-10 py-4 bg-rose-500 text-white rounded-full text-2xl font-bold shadow-xl hover:bg-rose-600 hover:scale-105 transition-all active:scale-95 group"
            >
              Start Journey <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        )}

        {currentScreen === 'journey' && (
          <div className="flex-1 p-8 md:p-12 flex flex-col space-y-8 overflow-y-auto items-center">
            <h2 className="text-3xl font-serif text-rose-800 text-center">Customize Your Gift</h2>
            
            <div className="w-full space-y-8 max-w-md">
              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="Tell me your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full bg-white/80 border-2 rounded-2xl p-4 text-lg text-center text-rose-700 focus:outline-none transition-all placeholder:text-rose-200 ${isNameEmpty ? 'border-rose-100' : 'border-rose-300 shadow-inner'}`}
                />
                {isNameEmpty && <p className="text-[10px] text-rose-400 text-center uppercase tracking-tighter">Please enter your name to continue</p>}
              </div>

              <ShuffleSelector 
                label="Select a Flower" 
                options={REAL_FLOWERS} 
                current={selectedFlower} 
                onChange={setSelectedFlower} 
              />

              <ShuffleSelector 
                label="Select a Color" 
                options={COLORS} 
                current={selectedColor} 
                onChange={setSelectedColor} 
              />

              <button 
                onClick={handleGenerateSingle}
                disabled={isNameEmpty}
                className={`w-full py-5 rounded-2xl font-bold text-xl transition-all shadow-lg mt-4 ${isNameEmpty ? 'bg-rose-200 text-white cursor-not-allowed grayscale' : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'}`}
              >
                Create a Surprise Gift
              </button>
            </div>
          </div>
        )}

        {currentScreen === 'flower_result' && flowerImage && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-3xl font-romantic text-rose-600">A Gift for You</h3>
              <p className="text-rose-400 italic">Something special, created just for you</p>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-rose-200 blur-2xl opacity-40 rounded-full animate-pulse"></div>
              <div className="relative z-10 p-2 bg-white rounded-3xl shadow-2xl transform rotate-1">
                <img 
                  src={flowerImage} 
                  alt="Hand-drawn flower" 
                  className="w-80 h-80 md:w-96 md:h-96 rounded-2xl object-cover border-4 border-rose-50"
                />
              </div>
            </div>

            <div className="flex flex-col w-full max-w-sm space-y-4">
              <button 
                onClick={handleGenerateBouquet}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-rose-600 transition-all flex items-center justify-center"
              >
                Continue
              </button>
              <button 
                onClick={() => setCurrentScreen('journey')}
                className="text-rose-400 hover:text-rose-600 transition-colors text-sm underline underline-offset-4"
              >
                Try a different combination
              </button>
            </div>
          </div>
        )}

        {currentScreen === 'bouquet_result' && bouquetImage && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-3xl font-romantic text-rose-600">A Special Delivery</h3>
              <p className="text-rose-400 italic">A lush bouquet for my favorite person</p>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-6 bg-rose-300 blur-3xl opacity-30 rounded-full"></div>
              <div className="relative z-10 p-3 bg-white rounded-[2.5rem] shadow-2xl transform -rotate-1">
                <img 
                  src={bouquetImage} 
                  alt="Personalized bouquet" 
                  className="w-80 h-80 md:w-96 md:h-96 rounded-[2rem] object-cover border-8 border-rose-50"
                />
              </div>
            </div>

            <div className="bg-rose-50/80 backdrop-blur-sm p-4 rounded-2xl border border-rose-100 max-w-xs shadow-inner">
               <p className="text-rose-700 font-medium italic">
                 Look closely! There's a card for you...
               </p>
            </div>

            <button 
              onClick={() => setCurrentScreen('final')}
              className="px-12 py-4 bg-rose-500 text-white rounded-full font-bold text-xl shadow-xl hover:bg-rose-600 transition-all group"
            >
              The Final Surprise <span className="inline-block group-hover:scale-125 transition-transform">🎁</span>
            </button>
          </div>
        )}

        {currentScreen === 'final' && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-12 animate-fade-in">
            <div className="relative">
              <div className="text-9xl animate-pulse">💝</div>
              <div className="absolute -top-4 -right-4 text-4xl animate-bounce delay-75">✨</div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl font-romantic text-rose-600 font-bold leading-tight">
                Will you be my Valentine?
              </h2>
              <p className="text-rose-400 font-serif italic">
                {userName}, you make every day feel like spring.
              </p>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 relative w-full justify-center items-center h-24">
              <button 
                onClick={() => setCurrentScreen('upload_picture')}
                className="px-16 py-5 bg-rose-500 text-white rounded-full text-3xl font-bold shadow-2xl hover:scale-110 active:scale-95 transition-all z-20"
              >
                YES!
              </button>
              <button 
                className="px-16 py-5 bg-gray-100 text-gray-400 rounded-full text-3xl font-bold transition-all duration-300 opacity-60 hover:opacity-100"
                onMouseEnter={(e) => {
                   const btn = e.currentTarget;
                   btn.style.position = 'absolute';
                   btn.style.left = Math.random() * 70 + '%';
                   btn.style.top = Math.random() * 70 + '%';
                   btn.style.zIndex = '10';
                }}
              >
                No
              </button>
            </div>
            <p className="text-rose-300 italic text-sm mt-8">(That 'No' button is very elusive today...)</p>
          </div>
        )}

        {currentScreen === 'upload_picture' && (
          <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-10 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-4xl font-romantic text-rose-600 font-bold">One Last Magic Moment...</h2>
              <p className="text-rose-800 font-serif italic text-lg leading-relaxed">
                "I want to turn us into a story. Please upload a picture of yourself (or both of us!)"
              </p>
            </div>

            <div className="w-full flex flex-col items-center space-y-8">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
              <input type="file" accept="image/*" className="hidden" ref={guyFileInputRef} onChange={handleGuyPhotoUpload} />
              
              <div className="relative w-full max-w-md flex justify-center items-center h-[350px]">
                {/* Main User Photo Container */}
                <div className={`relative transition-all duration-700 ease-in-out ${guyPhoto ? '-translate-x-16 scale-90' : ''}`}>
                  {!userPhoto ? (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-64 h-64 md:w-80 md:h-80 border-4 border-dashed border-rose-200 rounded-[2rem] flex flex-col items-center justify-center space-y-4 hover:border-rose-400 transition-colors bg-white/50 group"
                    >
                      <div className="text-6xl group-hover:scale-110 transition-transform">📸</div>
                      <span className="text-rose-400 font-romantic font-bold lowercase tracking-tight text-base italic">choose your picture</span>
                    </button>
                  ) : (
                    <div className="relative p-2 bg-white rounded-3xl shadow-2xl transform rotate-2">
                      <img src={userPhoto} alt="User preview" className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-2xl" />
                      <button 
                        onClick={() => setUserPhoto(null)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600"
                      >✕</button>
                    </div>
                  )}
                </div>

                {/* Guy Photo Container */}
                <div className={`absolute transition-all duration-700 ease-in-out ${guyPhoto ? 'translate-x-28 z-30' : 'right-0 bottom-0 md:right-4 md:bottom-4'}`}>
                  {!guyPhoto ? (
                    <div className="relative flex flex-col items-center">
                      <button 
                        onClick={() => guyFileInputRef.current?.click()}
                        className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-rose-600 transition-all hover:scale-110 border-4 border-white z-40 relative group"
                        title="Upload his photo too!"
                      >
                         <span className="text-3xl font-bold transition-transform group-hover:rotate-90">+</span>
                      </button>

                      {/* Updated Label below secondary button */}
                      <span className="text-blue-500 font-romantic text-base font-bold mt-4 animate-pulse pointer-events-none select-none whitespace-nowrap z-50">
                        your favorite picture of him
                      </span>
                    </div>
                  ) : (
                    <div className="relative p-1 bg-white rounded-2xl shadow-xl transform -rotate-3 border-4 border-white animate-fade-in">
                      <img src={guyPhoto} alt="Guy preview" className="w-32 h-32 md:w-44 md:h-44 object-cover rounded-xl shadow-inner" />
                      <button 
                        onClick={() => setGuyPhoto(null)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full text-sm flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors z-50"
                      >✕</button>
                      
                      {/* Note: Plus button removed after upload as per request */}
                    </div>
                  )}
                </div>
              </div>

              {userPhoto && (
                <button 
                  onClick={handleGenerateComic}
                  className="w-full max-w-sm py-5 bg-rose-500 text-white rounded-2xl font-bold text-xl shadow-xl hover:bg-rose-600 transition-all active:scale-95 animate-fade-in mt-4"
                >
                  Generate Our Story ✨
                </button>
              )}
            </div>
          </div>
        )}

        {currentScreen === 'comic_result' && comicImage && (
          <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-4xl font-romantic text-rose-600 font-bold">Our dreamy Valentine's proposal</h3>
              <p className="text-rose-400 italic font-serif">A comic strip of our love, drawn just for us.</p>
            </div>
            
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 bg-rose-200 blur-3xl opacity-30 rounded-full animate-pulse"></div>
              <div className="relative z-10 p-2 bg-white rounded-xl shadow-2xl border-8 border-white">
                <img 
                  src={comicImage} 
                  alt="Generated comic strip" 
                  className="w-full h-auto rounded-sm shadow-inner"
                />
              </div>
            </div>

            <div className="flex flex-col w-full max-w-xs space-y-4">
              <button 
                onClick={handleShare}
                className="w-full py-4 bg-rose-500 text-white rounded-full font-bold text-lg shadow-xl hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Share Our Story</span> <span>🚀</span>
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="text-rose-400 hover:text-rose-600 transition-colors text-sm underline underline-offset-4"
              >
                Start Over ❤️
              </button>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center transition-opacity duration-300">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-rose-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-24 h-24 border-8 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-serif text-rose-700 mt-8 font-bold">{loadingMessage}</h3>
            <p className="text-rose-400 mt-3 max-w-xs animate-pulse">
              Our AI artist is crafting something truly special. This creation might take a few moments...
            </p>
          </div>
        )}
      </main>

      {/* Decorative environment */}
      <div className="fixed top-0 left-0 p-12 text-7xl opacity-10 pointer-events-none rotate-12">💐</div>
      <div className="fixed top-0 right-0 p-12 text-7xl opacity-10 pointer-events-none -rotate-12">🎁</div>
      <div className="fixed bottom-0 left-0 p-12 text-7xl opacity-10 pointer-events-none -rotate-12">✨</div>
      <div className="fixed bottom-0 right-0 p-12 text-7xl opacity-10 pointer-events-none rotate-12">🍷</div>
    </div>
  );
};

export default App;