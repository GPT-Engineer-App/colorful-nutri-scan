import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Quagga from "quagga";
import axios from "axios";

const Index = () => {
  const [nutritionalInfo, setNutritionalInfo] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);
  const { toast } = useToast();
  const scannerRef = useRef(null);

  const fetchNutritionalInfo = async (query) => {
    try {
      const response = await axios.get(`https://api.nutritionix.com/v1_1/search/${query}`, {
        params: {
          appId: "YOUR_APP_ID",
          appKey: "YOUR_APP_KEY",
        },
      });
      setNutritionalInfo(response.data.hits[0].fields);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch nutritional information.",
      });
    }
  };

  const handleTakePicture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      video.addEventListener("loadedmetadata", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setPhoto(dataUrl);
        stream.getTracks().forEach(track => track.stop());
        fetchNutritionalInfo("food_image"); // Replace with actual image recognition API call
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to access the camera.",
      });
    }
  };

  const handleScanBarcode = () => {
    setScanning(true);
    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment"
        }
      },
      decoder: {
        readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_39_vin_reader", "codabar_reader", "upc_reader", "upc_e_reader", "i2of5_reader"]
      }
    }, (err) => {
      if (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to initialize barcode scanner.",
        });
        setScanning(false);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((data) => {
      setBarcodeData(data.codeResult.code);
      fetchNutritionalInfo(data.codeResult.code);
      Quagga.stop();
      setScanning(false);
    });
  };

  useEffect(() => {
    return () => {
      if (scanning) {
        Quagga.stop();
      }
    };
  }, [scanning]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Food Scanner</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button variant="outline" onClick={handleTakePicture} className="hover:bg-gray-200">
            Take a Picture of the Food
          </Button>
          <Button variant="outline" onClick={handleScanBarcode} disabled={scanning} className="hover:bg-gray-200">
            {scanning ? "Scanning..." : "Scan a Barcode of the Food"}
          </Button>
        </CardContent>
      </Card>
      {photo && (
        <Card className="w-full max-w-md mt-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Captured Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={photo} alt="Captured" className="rounded-md" />
          </CardContent>
        </Card>
      )}
      {barcodeData && (
        <Card className="w-full max-w-md mt-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Scanned Barcode</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{barcodeData}</p>
          </CardContent>
        </Card>
      )}
      <div ref={scannerRef} className="w-full max-w-md mt-4" />
      {nutritionalInfo && (
        <Card className="w-full max-w-md mt-4 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">Nutritional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nutrient</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(nutritionalInfo).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;