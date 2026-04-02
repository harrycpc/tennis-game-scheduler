import { useDesign } from '../context/DesignContext';
import { useEffect, useState } from 'react';
import svgPaths from '../imports/svg-wpsbvjy4pf';

export function PhoneStatusBar() {
  const { mode } = useDesign();
  const isLoFi = mode === 'lofi';
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;

  if (isLoFi) {
    return (
      <div className="relative bg-white">
        <div className="h-[44px] border-b border-[#D1D1D6] flex items-center justify-between px-[35px]">
          <div className="text-[15px] font-semibold text-[#000000]">
            [{formattedTime}]
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#000000]">
            <span>[SIG]</span>
            <span>[WiFi]</span>
            <span>[100%]</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black">
      <div className="h-[44px] overflow-clip relative w-full flex items-center justify-between px-[35px]">
        <div className="absolute h-[30px] left-0 right-0 top-0" />
        <div className="relative z-10 text-[15px] font-semibold tracking-tight text-white">
          {formattedTime}
        </div>
        <div className="relative z-10 flex gap-[4px] items-center">
          <div className="h-[14px] relative shrink-0 w-[20px]">
            <div className="absolute inset-[28.57%_30%_14.29%_55%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 8">
                <path clipRule="evenodd" d={svgPaths.p383d5700} fill="white" fillRule="evenodd" />
              </svg>
            </div>
            <div className="absolute inset-[42.86%_52.5%_14.29%_32.5%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 6">
                <path clipRule="evenodd" d={svgPaths.p28546400} fill="white" fillRule="evenodd" />
              </svg>
            </div>
            <div className="absolute bottom-[14.29%] left-[10%] right-3/4 top-[53.57%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 4.5">
                <path clipRule="evenodd" d={svgPaths.p129e3f40} fill="white" fillRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="h-[14px] relative shrink-0 w-[16px]">
            <div className="absolute inset-[63.85%_35.56%_14.29%_37.11%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.37186 3.06041">
                <path d={svgPaths.p1da632f0} fill="white" />
              </svg>
            </div>
            <div className="absolute inset-[39.07%_20.1%_37.26%_21.66%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.3198 3.31425">
                <path d={svgPaths.p2307b100} fill="white" />
              </svg>
            </div>
            <div className="absolute inset-[14.29%_4.69%_54.84%_6.25%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.25 4.32259">
                <path d={svgPaths.p392f1a00} fill="white" />
              </svg>
            </div>
          </div>
          <div className="h-[14px] relative shrink-0 w-[25px]">
            <div className="absolute h-[4px] left-[24px] top-[5px] w-px">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 4">
                <path d={svgPaths.p16442180} fill="#D1D5DB" />
              </svg>
            </div>
            <div className="absolute h-[12px] left-0 top-px w-[23px]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23 12">
                <path clipRule="evenodd" d={svgPaths.p48c4400} fill="#D1D5DB" fillRule="evenodd" />
              </svg>
            </div>
            <div className="-translate-y-1/2 absolute bg-white h-[8px] left-[2px] rounded-[1px] top-1/2 w-[19px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
