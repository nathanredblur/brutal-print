import { useState, useEffect } from "react";
import { WebBluetoothAdapter } from "mxw01-thermal-printer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BluetoothWarning() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const adapter = new WebBluetoothAdapter();
    if (!adapter.isAvailable()) {
      setOpen(true);
    }
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bluetooth not supported</AlertDialogTitle>
          <AlertDialogDescription>
            Your browser does not support Web Bluetooth, which is required to
            connect to the thermal printer. Please use{" "}
            <strong>Chrome</strong>, <strong>Edge</strong>, or{" "}
            <strong>Opera</strong> on a desktop computer.
            <br /><br />
            You can still design your layout, but printing won't be available.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
