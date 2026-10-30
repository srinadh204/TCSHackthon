import { AnomalyRule, DeviceType, AlertSeverity } from '../types';

export interface StoryPayload {
  rule: AnomalyRule;
  deviceIp: string;
  deviceName: string;
  deviceType: DeviceType;
  dstIp?: string;
  dstCountry?: string;
  dstPort?: number;
  protocol?: string;
  bytes?: number;
  severity: AlertSeverity;
}

export interface LocalizedStory {
  title: Record<'en' | 'hi' | 'ta', string>;
  story: Record<'en' | 'hi' | 'ta', string>;
  action: Record<'en' | 'hi' | 'ta', string>;
}

export function generateTrafficStory(payload: StoryPayload): LocalizedStory {
  const { deviceIp, deviceName, deviceType, dstIp, dstCountry = 'Unknown Location', dstPort, bytes = 0 } = payload;
  const mbFormatted = (bytes / (1024 * 1024)).toFixed(1);

  switch (payload.rule) {
    case 'NEW_EXTERNAL_CONNECTION':
      return {
        title: {
          en: `Unauthorized External Connection: ${deviceName} (${deviceType})`,
          hi: `अनधिकृत बाहरी कनेक्शन: ${deviceName} (${deviceType})`,
          ta: `அங்கீகரிக்கப்படாத வெளிப்புற இணைப்பு: ${deviceName} (${deviceType})`,
        },
        story: {
          en: `Your ${deviceType} at ${deviceIp} initiated an unexpected outbound connection to an unknown external server (${dstIp}) in ${dstCountry} on port ${dstPort}. Industrial plant controllers should never communicate directly with the public internet.`,
          hi: `आपकी फैक्ट्री का ${deviceType} (${deviceIp}) अचानक ${dstCountry} में स्थित एक अज्ञात सर्वर (${dstIp}, पोर्ट ${dstPort}) से कनेक्ट हुआ है। प्लांट मशीनों को सीधे इंटरनेट से नहीं जुड़ना चाहिए। यह साइबर जासूसी या हैकिंग का संकेत हो सकता है।`,
          ta: `உங்கள் ${deviceType} (${deviceIp}) எதிர்பாராதவிதமாக ${dstCountry} நாட்டின் தெரியாத சர்வரோடு (${dstIp}, போர்ட் ${dstPort}) இணைக்கப்பட்டுள்ளது. தொழிற்சாலை இயந்திரங்கள் பொது இணையத்துடன் இணையக்கூடாது. இது இணைய தாக்குதலின் அறிகுறியாக இருக்கலாம்.`,
        },
        action: {
          en: `Confirm immediately with your line supervisor whether remote maintenance was scheduled. If not, block IP ${dstIp} on the factory router firewall and change the device root password.`,
          hi: `तुरंत प्लांट इंजीनियर से पूछें कि क्या कोई रिमोट मेंटेनेंस तय था? यदि नहीं, तो राउटर फ़ायरवॉल पर IP ${dstIp} को ब्लॉक करें और डिवाइस का पासवर्ड तुरंत बदलें।`,
          ta: `தொழிற்சாலை பொறியாளரிடம் இது திட்டமிடப்பட்ட பராமரிப்பா என விசாரிக்கவும். இல்லை என்றால், ஃபயர்வால் மூலம் இந்த IP ${dstIp} ஐ முடக்கி, கடவுச்சொல்லை மாற்றவும்.`,
        },
      };

    case 'UNUSUAL_PROTOCOL':
      return {
        title: {
          en: `Suspicious Protocol Detected: SSH Remote Shell on ${deviceName}`,
          hi: `संदिग्ध प्रोटोकॉल: ${deviceName} पर SSH रिमोट शेल कनेक्शन`,
          ta: `சந்தேகத்திற்குரிய நெறிமுறை: ${deviceName} இல் SSH ரிமோட் ஷெல்`,
        },
        story: {
          en: `The ${deviceType} (${deviceIp}) typically only exchanges industrial Modbus control signals. Just now, an administrative SSH terminal session (port 22) was initiated from ${dstIp}. This strongly suggests an attempted remote takeover or unauthorized firmware alteration.`,
          hi: `यह ${deviceType} (${deviceIp}) सामान्यतः केवल मॉडबस सिग्नल भेजता है। अभी-अभी इस पर बाहरी IP (${dstIp}) से एडमिनिस्ट्रेटिव SSH टर्मिनल (पोर्ट 22) खोला गया है। यह मशीन के कंट्रोल में सेंधमारी का बड़ा संकेत है।`,
          ta: `இந்த ${deviceType} (${deviceIp}) வழக்கமாக Modbus சிக்னல்களை மட்டுமே பரிமாறும். ஆனால் இப்போது ${dstIp} இலிருந்து SSH டெர்மினல் (போர்ட் 22) திறக்கப்பட்டுள்ளது. இது இயந்திரத்தை யாரோ கட்டுப்படுத்த முயல்வதைக் காட்டுகிறது.`,
        },
        action: {
          en: `Unplug the Ethernet cable or disable port 22 on the switch. Inspect physical machine controls and verify who is logged into the workstation.`,
          hi: `मशीन की ईथरनेट केबल तुरंत निकालें या स्विच पर पोर्ट 22 बंद करें। ऑपरेटर पैनल पर जाकर मशीन की स्थिति जांचें।`,
          ta: `இயந்திரத்தின் ஈதர்நெட் கேபிளை உடனடியாக அகற்றவும் அல்லது போர்ட் 22 ஐ மூடவும். ஆபரேட்டர் பேனலில் நிலையைச் சரிபார்க்கவும்.`,
        },
      };

    case 'DATA_EXFILTRATION_SPIKE':
      return {
        title: {
          en: `Abnormal High-Volume Data Exfiltration: ${deviceName}`,
          hi: `असामान्य भारी डेटा चोरी (Exfiltration): ${deviceName}`,
          ta: `அசாதாரண அதிக அளவிலான தரவு திருட்டு: ${deviceName}`,
        },
        story: {
          en: `Your CCTV camera (${deviceIp}) sent an abnormal spike of ${mbFormatted} MB of encrypted data in the last 2 minutes to an untrusted external endpoint (${dstIp}). Factory cameras often carry default manufacturer passwords and get hijacked into video exfiltration botnets.`,
          hi: `आपके सीसीटीवी कैमरा (${deviceIp}) ने पिछले 2 मिनट में ${mbFormatted} MB डेटा अज्ञात बाहरी सर्वर (${dstIp}) पर भेजा है। अक्सर कमज़ोर या डिफ़ॉल्ट पासवर्ड के कारण कैमरे हैक होकर फुटेज बाहर भेजने लगते हैं।`,
          ta: `உங்கள் CCTV கேமரா (${deviceIp}) கடந்த 2 நிமிடங்களில் ${mbFormatted} MB அளவிலான தரவை வெளி சர்வர்க்கு (${dstIp}) அனுப்பியுள்ளது. இயல்புநிலை கடவுச்சொல் மாற்றப்படாத கேமராக்கள் இணைய திருடர்களால் ஹேக் செய்யப்படலாம்.`,
        },
        action: {
          en: `Isolate camera IP ${deviceIp} to internal NVR recording only. Deny internet gateway access for all security cameras and upgrade firmware.`,
          hi: `इस कैमरे की बाहरी इंटरनेट एक्सेस तुरंत बंद करें ताकि यह केवल लोकल NVR से जुड़ा रहे। कैमरे का डिफ़ॉल्ट पासवर्ड बदलें।`,
          ta: `கேமராவின் இணைய அணுகலைத் தடுத்து, உள்ளூர் NVR ரெக்கார்டருடன் மட்டும் இணைக்கவும். கேமராவின் பாஸ்வேர்டை உடனே மாற்றவும்.`,
        },
      };

    case 'UNEXPECTED_PEER_COMM':
      return {
        title: {
          en: `Rogue Internal Device Scanning Critical Production PLC`,
          hi: `अज्ञात अंदरूनी कंप्यूटर द्वारा PLC मशीनों की अनधिकृत स्कैनिंग`,
          ta: `அங்கீகரிக்கப்படாத லேப்டாப் PLC இயந்திரங்களை ஸ்கேன் செய்கிறது`,
        },
        story: {
          en: `An uncataloged office laptop at ${dstIp} started aggressively probing production PLC ${deviceName} (${deviceIp}) on industrial Modbus port 502, completely bypassing the authorized SCADA supervisor server.`,
          hi: `ऑफिस नेटवर्क के एक अज्ञात कंप्यूटर (${dstIp}) ने सीधे प्लांट के PLC ${deviceName} (${deviceIp}) पर मॉडबस पोर्ट 502 को स्कैन करना शुरू किया है। यह अनधिकृत हस्तक्षेप या मैलवेयर हो सकता है।`,
          ta: `அங்கீகரிக்கப்படாத கணினி (${dstIp}) நேரடியாக தொழிற்சாலையின் PLC ${deviceName} (${deviceIp}) போர்ட் 502 ஐ ஸ்கேன் செய்கிறது. இது SCADA அனுமதியை மீறிய ஆபத்தான செயல்.`,
        },
        action: {
          en: `Locate workstation ${dstIp} on the shop floor or Wi-Fi AP. Disconnect it from the production VLAN and run an antivirus scan.`,
          hi: `पता लगाएं कि IP ${dstIp} वाला लैपटॉप किसका है। इसे तुरंत प्रोडक्शन नेटवर्क से हटाएं और एंटीवायरस स्कैन चलाएं।`,
          ta: `IP ${dstIp} கணினியை வைஃபை அல்லது நெட்வொர்க்கில் இருந்து உடனே துண்டித்து, வைரஸ் சோதனை செய்யவும்.`,
        },
      };

    case 'ROGUE_OT_DEVICE':
    default:
      return {
        title: {
          en: `New Unknown Device Joined Factory Subnet: ${deviceIp}`,
          hi: `नया अज्ञात डिवाइस फैक्ट्री नेटवर्क से जुड़ा: ${deviceIp}`,
          ta: `புதிய தெரியாத சாதனம் நெட்வொர்க்கில் இணைந்தது: ${deviceIp}`,
        },
        story: {
          en: `A new hardware device with unregistered MAC address appeared on the production OT subnet (${deviceIp}). It is generating broadcast ARP packets and attempting to poll nearby controllers.`,
          hi: `एक नया अज्ञात हार्डवेयर डिवाइस (${deviceIp}) प्रोडक्शन नेटवर्क से जुड़ा है। इसका MAC एड्रेस ऑथराइज्ड नहीं है और यह पास के कंट्रोलर्स से जुड़ने का प्रयास कर रहा है।`,
          ta: `அங்கீகரிக்கப்படாத புதிய சாதனம் (${deviceIp}) தொழிற்சாலை நெட்வொர்க்கில் இணைக்கப்பட்டுள்ளது. இது அருகிலுள்ள கன்ட்ரோலர்களைத் தொடர்பு கொள்ள முயல்கிறது.`,
        },
        action: {
          en: `Physically trace the Ethernet port or Wi-Fi MAC to identify the contractor or rogue hardware, then assign it to a restricted guest VLAN.`,
          hi: `स्विच रूम में जाकर देखें कि किस पोर्ट पर नया केबल जुड़ा है। अनधिकृत व्यक्ति का डिवाइस होने पर पोर्ट बंद करें।`,
          ta: `சுவிட்ச் போர்ட்டை ஆய்வு செய்து, புதிய சாதனத்தை கண்டறிந்து, தேவைப்பட்டால் போர்ட்டை முடக்கவும்.`,
        },
      };
  }
}
