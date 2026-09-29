# Q-pet 🐾

Sistema web inteligente para la generación, gestión y escaneo de placas QR de identificación para mascotas (perros y gatos), con contacto inmediato vía WhatsApp, llamada telefónica y envío de ubicación GPS en tiempo real.

---

## 🌟 Características Principales

* **Placa QR Inteligente**: Generación instantánea de códigos QR vectoriales con el ícono distintivo de huella, listos para descargar en alta resolución o imprimir para collares físicos.
* **Ficha Pública de Rescate (Vista al escanear)**:
  * Información esencial: Foto de la mascota, nombre, especie, raza, edad, sexo, estado de vacunación y número de microchip.
  * **WhatsApp 1-Tap**: Abre un chat directo con el dueño con un mensaje pre-estructurado.
  * **Llamada de Emergencia**: Marcado telefónico directo al dueño o número de respaldo.
  * **Envío de Ubicación GPS**: El rescatista puede compartir sus coordenadas exactas (enlace de Google Maps) con un solo toque hacia el WhatsApp del dueño.
  * Cuidados médicos, alergias alimentarias y recompensas ofrecidas.
* **Diseño Responsivo (Desktop y Mobile)**:
  * Adaptado con una paleta cálida ámbar dorado (`#FFA800`), vainilla crema (`#FFF8EC`) y carbón espresso (`#1C1917`).
  * En Desktop: Cuadrícula multivista, barra de navegación completa con accesos directos y vista dividida en dos columnas para perfiles.
  * En Móvil: Experiencia fluida con barra inferior y cabecera orgánica curva.
* **Catálogo Extenso de Razas**:
  * Más de 45 razas caninas (Golden Retriever, Bulldog Francés, Poodle, Pastor Alemán, Mestizo/Criollo, etc.) y más de 35 razas felinas (Siamés, Scottish Fold, Persa, Maine Coon, etc.) con autocompletado y botones de selección rápida.
* **Lector QR Integrado**:
  * Escáner nativo mediante cámara web/móvil con `jsQR` y soporte para subir fotos desde la galería o simular escaneos.
* **Persistencia Local**: Guarda las mascotas y cambios en `localStorage`.

---

## 🚀 Tecnologías

* **React 19**
* **Vite**
* **Vanilla CSS (Design Tokens)**
* **qrcode.react**
* **jsQR** (Lector QR con cámara web)
* **lucide-react** (Iconografía limpia sin emojis)
* **canvas-confetti**

---

## 📦 Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/lealjesusalberto/petscope.git

# Entrar al directorio
cd petscope

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:8089/` y en la IP de red local para pruebas móviles.

---

## 📄 Licencia

MIT
