
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { ConversionStatus, ConversionStep } from './types';
import { extractTextFromPdf } from './services/pdfService';
import { reformTextWithAI } from './services/geminiService';
import { generateDocx } from './services/wordService';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<ConversionStep>({
    status: ConversionStatus.IDLE,
    message: 'Sẵn sàng chuyển đổi',
    progress: 0
  });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setStep({ status: ConversionStatus.IDLE, message: 'Đã tải tệp lên', progress: 0 });
        setResultBlob(null);
      } else {
        alert('Vui lòng chọn tệp PDF!');
      }
    }
  };

  const startConversion = async () => {
    if (!file) return;

    try {
      // Step 1: Extract Text
      setStep({ status: ConversionStatus.READING, message: 'Đang đọc nội dung PDF...', progress: 0 });
      const pages = await extractTextFromPdf(file, (p) => {
        setStep(prev => ({ ...prev, progress: p }));
      });

      // Step 2: AI Reformatting
      setStep({ status: ConversionStatus.AI_PROCESSING, message: 'AI đang phân tích và định dạng lại văn bản...', progress: 50 });
      const refinedText = await reformTextWithAI(pages);

      // Step 3: Generate Word
      setStep({ status: ConversionStatus.GENERATING_WORD, message: 'Đang tạo tệp Word...', progress: 90 });
      const wordName = file.name.replace('.pdf', '') + '_converted.docx';
      const blob = await generateDocx(refinedText, wordName);

      setResultBlob(blob);
      setStep({ status: ConversionStatus.COMPLETED, message: 'Chuyển đổi hoàn tất!', progress: 100 });
    } catch (error) {
      console.error(error);
      setStep({ status: ConversionStatus.ERROR, message: 'Có lỗi xảy ra trong quá trình chuyển đổi.', progress: 0 });
    }
  };

  const downloadFile = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '') + '.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Chuyển <span className="text-blue-600">PDF</span> sang <span className="text-indigo-600">Word</span> thông minh
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sử dụng trí tuệ nhân tạo Gemini để giữ nguyên cấu trúc văn bản, tiêu đề và định dạng khi chuyển đổi từ PDF.
          </p>
        </section>

        {/* Upload & Action Area */}
        <section className="glass-effect rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-100 border border-white">
          {!resultBlob ? (
            <div className="space-y-8">
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 group-hover:border-blue-400'}`}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-800">
                        {file ? file.name : 'Nhấn hoặc kéo tệp PDF vào đây'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">Dung lượng tối đa 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {file && step.status === ConversionStatus.IDLE && (
                <div className="flex justify-center">
                  <Button onClick={startConversion} className="w-full md:w-auto text-lg">
                    Bắt đầu chuyển đổi ngay
                  </Button>
                </div>
              )}

              {step.status !== ConversionStatus.IDLE && step.status !== ConversionStatus.COMPLETED && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-blue-600 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </span>
                      {step.message}
                    </span>
                    <span className="text-slate-500">{step.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500 ease-out"
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-8 py-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Chuyển đổi thành công!</h3>
              <p className="text-slate-600">Tệp của bạn đã sẵn sàng để tải xuống.</p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button onClick={downloadFile} className="bg-green-600 hover:bg-green-700 shadow-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tải tệp Word xuống
                </Button>
                <Button variant="secondary" onClick={() => { setFile(null); setResultBlob(null); setStep({ status: ConversionStatus.IDLE, message: '', progress: 0 }); }}>
                  Chuyển đổi tệp khác
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Định dạng AI"
            description="AI phân tích bố cục để tái tạo lại tiêu đề và các đoạn văn một cách tự nhiên nhất."
            icon="✨"
          />
          <FeatureCard 
            title="Bảo mật tuyệt đối"
            description="Tệp của bạn được xử lý ngay trong trình duyệt và không được lưu trữ vĩnh viễn."
            icon="🔒"
          />
          <FeatureCard 
            title="Tốc độ vượt trội"
            description="Sử dụng sức mạnh của Gemini Flash 2.5 để xử lý văn bản dài chỉ trong vài giây."
            icon="⚡"
          />
        </section>
      </main>

      <footer className="mt-24 text-center text-slate-400 text-sm">
        <p>© 2024 PDF to Word AI Pro. Phát triển bởi World-Class Engineer.</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; description: string; icon: string }> = ({ title, description, icon }) => (
  <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="text-3xl mb-4">{icon}</div>
    <h4 className="font-bold text-slate-900 mb-2">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </div>
);

export default App;
