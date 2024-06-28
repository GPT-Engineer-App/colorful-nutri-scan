import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [nutritionalInfo, setNutritionalInfo] = useState(null);
  const [photo, setPhoto] = useState(null);
  const { toast } = useToast();

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
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to access the camera.",
      });
    }
  };

  const handleScanBarcode = () => {
    // Implement functionality to scan a barcode using the device's camera
    toast({
      title: "Feature not implemented",
      description: "Scanning a barcode is not yet implemented.",
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4 bg-gradient-to-r from-green-400 to-blue-500">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Food Scanner</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button variant="outline" onClick={handleTakePicture}>
            Take a Picture of the Food
          </Button>
          <Button variant="outline" onClick={handleScanBarcode}>
            Scan a Barcode of the Food
          </Button>
        </CardContent>
      </Card>
      {photo && (
        <Card className="w-full max-w-md mt-4">
          <CardHeader>
            <CardTitle className="text-center text-xl">Captured Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={photo} alt="Captured" />
          </CardContent>
        </Card>
      )}
      {nutritionalInfo && (
        <Card className="w-full max-w-md mt-4">
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