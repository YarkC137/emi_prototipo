console.log('script.js: File loaded');

// Inicialización global de la variable loads para todas las cargas
window.loads = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js: DOMContentLoaded event fired');
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    const addNodeButton = document.getElementById('addNodeButton');
    const addMemberButton = document.getElementById('addMemberButton'); // Toolbar button

    // Node Editor Modal elements
    const nodeEditorModal = document.getElementById('nodeEditorModal');
    const closeButtonNodeEditor = nodeEditorModal.querySelector('.close-button');
    const nodeXInput = document.getElementById('nodeX');
    const nodeYInput = document.getElementById('nodeY');
    const nodeLabelInput = document.getElementById('nodeLabel');
    const saveNodeChangesButton = document.getElementById('saveNodeChanges');
    const cancelNodeChangesButton = document.getElementById('cancelNodeChanges');
    let currentlyEditingNode = null;

    // Member Properties Modal elements
    const memberPropertiesModal = document.getElementById('memberPropertiesModal');
    const closeButtonMemberProps = memberPropertiesModal.querySelector('.member-close-button');
    const addFrameElementButton = document.getElementById('addFrameElementButton');
    const addTrussElementButton = document.getElementById('addTrussElementButton');
    const sectionPropertiesButton = document.getElementById('sectionPropertiesButton'); // Button to open Section Props modal
    const addHingeButton = document.getElementById('addHingeButton'); // Botón para añadir rótulas
    const cancelMemberPropertiesButton = document.getElementById('cancelMemberProperties');
    
    // Load Type Modal elements
    const loadTypeModal = document.getElementById('loadTypeModal');
    const closeButtonLoadType = loadTypeModal.querySelector('.load-close-button');
    const pointLoadMemberButton = document.getElementById('pointLoadMemberButton');
    const pointLoadNodeButton = document.getElementById('pointLoadNodeButton');
    const distributedLoadButton = document.getElementById('distributedLoadButton');
    const momentLoadButton = document.getElementById('momentLoadButton');
    const cancelLoadTypeButton = document.getElementById('cancelLoadType');
    const addLoadButton = document.getElementById('addLoadButton'); // Botón para añadir cargas
    
    // Modal para editar carga distribuida
    const editDistLoadModal = document.getElementById('editDistLoadModal');
    const closeEditDistLoadButton = document.getElementById('closeEditDistLoad');
    const editStartLoadInput = document.getElementById('editStartLoadInput');
    const editEndLoadInput = document.getElementById('editEndLoadInput');
    const saveEditDistLoadButton = document.getElementById('saveEditDistLoad');
    const cancelEditDistLoadButton = document.getElementById('cancelEditDistLoad');
    
    // Hacer las variables de edición de carga distribuida accesibles globalmente
    window.editDistLoadModal = editDistLoadModal;
    window.editStartLoadInput = editStartLoadInput;
    window.editEndLoadInput = editEndLoadInput;
    window.editStartDistanceInput = document.getElementById('editStartDistanceInput');
    window.editEndDistanceInput = document.getElementById('editEndDistanceInput');
    
    // Variable global para la carga que está siendo editada
    window.currentEditingLoad = null; // Para rastrear qué carga estamos editando
    
    // Point Load Member Modal elements
    const pointLoadMemberModal = document.getElementById('pointLoadMemberModal');
    const closeButtonPointLoadMember = pointLoadMemberModal.querySelector('.point-load-member-close-button');
    const loadDistanceInput = document.getElementById('loadDistance');
    const loadMagnitudeInput = document.getElementById('loadMagnitude');
    const loadAngleInput = document.getElementById('loadAngle');
    const savePointLoadMemberButton = document.getElementById('savePointLoadMember');
    const cancelPointLoadMemberButton = document.getElementById('cancelPointLoadMember');
    
    // Moment Load Modal elements
    const momentLoadModal = document.getElementById('momentLoadModal');
    const closeMomentLoadButton = document.getElementById('closeMomentLoad');
    const momentLoadInput = document.getElementById('momentLoadInput');
    const clockwiseButton = document.getElementById('clockwiseButton');
    const counterClockwiseButton = document.getElementById('counterClockwiseButton');
    const saveMomentLoadButton = document.getElementById('saveMomentLoad');
    const cancelMomentLoadButton = document.getElementById('cancelMomentLoad');

    // Section Properties Modal elements
    const sectionPropsModal = document.getElementById('sectionPropsModal');
    const closeSectionPropsModalButton = document.getElementById('closeSectionPropsModal'); // X button in Section Props modal
    const addNewSectionPropertyButton = document.getElementById('addNewSectionProperty'); // Plus button
    const sectionPropertyListUL = document.getElementById('sectionPropertyList'); // The UL for properties

    // Edit Section Modal Elements (New)
    const editSectionModal = document.getElementById('editSectionModal');
    const closeEditSectionModalButton = document.getElementById('closeEditSectionModal');
    const editSectionNameInput = document.getElementById('editSectionName');
    const editModulusElasticityInput = document.getElementById('editModulusElasticity');
    const editUnitWeightInput = document.getElementById('editUnitWeight');
    const editThermalCoefficientInput = document.getElementById('editThermalCoefficient');
    const editAreaInput = document.getElementById('editArea');
    const editInertiaInput = document.getElementById('editInertia');
    const saveSectionDetailChangesButton = document.getElementById('saveSectionDetailChanges');
    const cancelSectionDetailChangesButton = document.getElementById('cancelSectionDetailChanges');

    // Member Action Buttons
    const assignSectionButton = document.getElementById('assignSectionButton');
    const deleteMemberButton = document.getElementById('deleteMemberButton');
    
    // Assign Section Modal Elements
    const assignSectionModal = document.getElementById('assignSectionModal');
    const availableSectionsDropdown = document.getElementById('availableSectionsDropdown');
    const confirmAssignSectionButton = document.getElementById('confirmAssignSectionButton');
    const cancelAssignSectionButton = document.getElementById('cancelAssignSectionButton');
    const assignSectionCloseButton = assignSectionModal.querySelector('.assign-section-close-button');

    let canvasWidth = canvas.offsetWidth;
    let canvasHeight = canvas.offsetHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    let isAddingNodeMode = false;
    let nodes = [];
    let nextNodeIdCounter = 1;

    let members = [];
    let nextFrameIdCounter = 1;
    let nextTrussIdCounter = 1;
    let selectedMemberId = null; // Para rastrear el miembro seleccionado
    let selectedNodeId = null; // Para rastrear el nodo seleccionado
    let selectedLoadId = null; // Para rastrear la carga seleccionada
    let loads = []; // Array para almacenar todas las cargas (puntuales, distribuidas, etc.)

    // Estado para el modo de añadir cargas
    let loadDrawState = {
        active: false,
        type: null, // 'pointMember', 'pointNode', 'distributed', 'moment'
        selectingStage: 0, // 0: inactivo, 1: seleccionando punto de aplicación
        selectedMemberId: null // Para almacenar el miembro seleccionado para la carga
    };

    // Member drawing state
    let memberDrawState = {
        active: false,
        type: null, // 'frame' or 'truss'
        firstNode: null,
        selectingStage: 0 // 0: inactive, 1: selecting first node, 2: selecting second node
    };
    
    // ID para las cargas
    let nextLoadId = 1;

    const gridSize = 50;
    const axisColor = '#888';
    const gridLineColor = '#444';
    const textColor = '#ccc';
    const nodeColor = '#FFD700';
    const nodeRadius = 6;
    const clickTolerance = nodeRadius * 1.5;
    const frameColor = '#FF0000'; // Red for Frame
    const trussColor = '#0000FF'; // Blue for Truss
    const memberLineWidth = 2;
    const selectedNodeColor = '#00FF00'; // Green for highlighting selected node for member

    const originX = () => canvasWidth / 2 + panX;
    const originY = () => canvasHeight / 2 + panY;

    let sectionPropertiesData = {
        'default': { // 'default' is the ID for "1DEFAULT"
            name: '1DEFAULT',
            modulusElasticity: 200, // GPa
            unitWeight: 0,          // kN/m3
            thermalCoefficient: 0,  // 1/°C
            area: 0.02,             // m2
            inertia: 100            // cm4
        }
    };
    let currentlyEditingSectionId = null; // Will be used for the edit modal

    // Función para dibujar cargas puntuales sobre barras
    function drawPointLoads() {
        const currentOriginX = originX();
        const currentOriginY = originY();
        
        console.log('drawPointLoads: verificando cargas...');
        // Para depuración: asegurarse de que loads esté definido globalmente
        if (typeof loads === 'undefined' || loads === null) {
            console.warn('drawPointLoads: El array de cargas no está definido. Inicializando...');
            window.loads = [];
            return;
        }
        
        // Recorrer todas las cargas
        loads.forEach(load => {
            if (load.type === 'point' || load.type === 'pointMember') {
                // Carga puntual sobre una barra
                const member = members.find(m => m.id === load.memberId);
                if (!member) return;
                
                const startNode = nodes.find(n => n.id === member.startNodeId);
                const endNode = nodes.find(n => n.id === member.endNodeId);
                if (!startNode || !endNode) return;
                
                // Calcular las coordenadas de los nodos en el canvas
                const startX = currentOriginX + startNode.x * gridSize;
                const startY = currentOriginY - startNode.y * gridSize;
                const endX = currentOriginX + endNode.x * gridSize;
                const endY = currentOriginY - endNode.y * gridSize;
                
                // Calcular la longitud del miembro
                const memberLength = Math.sqrt(
                    Math.pow(endNode.x - startNode.x, 2) + 
                    Math.pow(endNode.y - startNode.y, 2)
                );
                
                // Calcular la posición de la carga a lo largo del miembro
                const ratio = load.distance / memberLength;
                const loadX = startX + (endX - startX) * ratio;
                const loadY = startY + (endY - startY) * ratio;
                
                // Calcular la dirección de la flecha basada en el ángulo
                // Convertir el ángulo a radianes, usando el sistema estándar:
                // 0° = este, 90° = norte, 180° = oeste, 270° = sur
                const angleRad = load.angle * (Math.PI / 180);
                const arrowLength = 60; // Longitud fija para la flecha
                
                // El punto de aplicación de la carga (sobre la barra)
                const arrowStartX = loadX+ arrowLength * Math.cos(angleRad);
                const arrowStartY = loadY- arrowLength * Math.sin(angleRad);
                
                // La punta de la flecha se extiende desde el punto de aplicación en la dirección del ángulo
                // Invertimos la dirección para que la fuerza vaya en sentido contrario
                // Seguimos la convención matemática estándar para los ángulos
                const arrowEndX = loadX ;
                const arrowEndY = loadY ; // Positivo para invertir la dirección
                
                // Dibujar la línea de la flecha
                ctx.beginPath();
                ctx.strokeStyle = '#FF0000'; // Rojo para las cargas
                ctx.lineWidth = 2;
                ctx.moveTo(arrowStartX, arrowStartY);
                ctx.lineTo(arrowEndX, arrowEndY);
                ctx.stroke();
                
                // Dibujar la punta de la flecha en el punto de aplicación
                const headLength = 10; // Tamaño de la punta de la flecha
                
                // Calcular los ángulos para las líneas de la punta
                // Para la dirección correcta (90° = norte a sur)
                const arrowAngle = Math.atan2(arrowEndY - arrowStartY, arrowEndX - arrowStartX);
                const angle1 = arrowAngle - Math.PI / 6; 
                const angle2 = arrowAngle + Math.PI / 6;
                
                ctx.beginPath();
                ctx.fillStyle = '#FF0000';
                ctx.moveTo(arrowEndX, arrowEndY);
                ctx.lineTo(
                    arrowEndX - headLength * Math.cos(angle1),
                    arrowEndY - headLength * Math.sin(angle1)
                );
                ctx.lineTo(
                    arrowEndX - headLength * Math.cos(angle2),
                    arrowEndY - headLength * Math.sin(angle2)
                );
                ctx.closePath();
                ctx.fill();
                //BARRA
                // Mostrar la magnitud de la carga
                ctx.fillStyle = '#FFFFFF'; // Texto en blanco
                ctx.font = '25px gabriola';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textX = arrowStartX ;
                const textY = arrowStartY  ;
                ctx.fillText(`${load.magnitude} kN`, textX, textY);
            } else if (load.type === 'pointNode') {
                // Carga puntual en un nodo
                const node = nodes.find(n => n.id === load.nodeId);
                if (!node) return;
                
                // Calcular las coordenadas del nodo en el canvas
                const nodeX = currentOriginX + node.x * gridSize;
                const nodeY = currentOriginY - node.y * gridSize;
                
                // Calcular la dirección de la flecha basada en el ángulo
                const angleRad = load.angle * (Math.PI / 180);
                const arrowLength = 60; // Longitud fija para la flecha
                //   NODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
                // Punto de aplicación de la carga (el nodo)
                const arrowStartX = nodeX;
                const arrowStartY = nodeY;
                
                // Calcular el punto final de la flecha - usando la misma convención que para cargas en barra
                const arrowEndX = nodeX - arrowLength * Math.cos(angleRad);
                const arrowEndY = nodeY + arrowLength * Math.sin(angleRad); // Positivo porque Y aumenta hacia abajo
                
                // Dibujar la línea de la flecha
                ctx.beginPath();
                ctx.strokeStyle = '#FF0000'; // Rojo para las cargas
                ctx.lineWidth = 2;
                ctx.moveTo(arrowStartX, arrowStartY);
                ctx.lineTo(arrowEndX, arrowEndY);
                ctx.stroke();
                
                // Dibujar la punta de la flecha
                const headLength = 10; // Tamaño de la punta de la flecha
                
                // Calcular los ángulos para las líneas de la punta
                // Para la dirección correcta (90° = norte a sur)
                const arrowAngle = Math.atan2(arrowEndY - arrowStartY, arrowEndX - arrowStartX);
                const angle1 = arrowAngle - Math.PI / 6; 
                const angle2 = arrowAngle + Math.PI / 6;
                
                ctx.beginPath();
                ctx.fillStyle = '#FF0000';
                ctx.moveTo(arrowEndX, arrowEndY);
                ctx.lineTo(
                    arrowEndX - headLength * Math.cos(angle1),
                    arrowEndY - headLength * Math.sin(angle1)
                );
                ctx.lineTo(
                    arrowEndX - headLength * Math.cos(angle2),
                    arrowEndY - headLength * Math.sin(angle2)
                );
                ctx.closePath();
                ctx.fill();
                // NODO
                // Mostrar la magnitud de la carga
                ctx.fillStyle = '#FFFFFF'; // Texto en blanco
                ctx.font = '20px gabriola';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textX = arrowEndX ;
                const textY = arrowEndY +   10;
                ctx.fillText(`${load.magnitude} kN`, textX, textY);
            }
        });
    }
    
    function drawGrid() {
        console.log('script.js: drawGrid() called');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#080909';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const currentOriginX = originX();
        const currentOriginY = originY();

        ctx.beginPath();
        ctx.strokeStyle = gridLineColor;
        ctx.lineWidth = 0.5;
        for (let x = currentOriginX % gridSize; x < canvasWidth; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
        }
        for (let y = currentOriginY % gridSize; y < canvasHeight; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1;
        ctx.moveTo(0, currentOriginY);
        ctx.lineTo(canvasWidth, currentOriginY);
        ctx.moveTo(currentOriginX, 0);
        ctx.lineTo(currentOriginX, canvasHeight);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 1; (currentOriginX + i * gridSize) < canvasWidth; i++) {
            ctx.fillText(i, currentOriginX + i * gridSize, currentOriginY + 15);
        }
        for (let i = -1; (currentOriginX + i * gridSize) > 0; i--) {
            ctx.fillText(i, currentOriginX + i * gridSize, currentOriginY + 15);
        }
        for (let i = 1; (currentOriginY - i * gridSize) > 0; i++) {
            ctx.fillText(i, currentOriginX - 15, currentOriginY - i * gridSize);
        }
        for (let i = -1; (currentOriginY - i * gridSize) < canvasHeight; i--) {
            ctx.fillText(i, currentOriginX - 15, currentOriginY - i * gridSize);
        }
        ctx.fillText('0', currentOriginX - 15, currentOriginY + 15);

        // Draw Members
        ctx.lineWidth = memberLineWidth;
        ctx.font = '10px Arial';
        members.forEach(member => {
            const startNode = nodes.find(n => n.id === member.startNodeId);
            const endNode = nodes.find(n => n.id === member.endNodeId);
            if (!startNode || !endNode) return;

            const startX = currentOriginX + startNode.x * gridSize;
            const startY = currentOriginY - startNode.y * gridSize;
            const endX = currentOriginX + endNode.x * gridSize;
            const endY = currentOriginY - endNode.y * gridSize;

            // Guardar el estado original del contexto
            const originalLineWidth = ctx.lineWidth;
            const originalStrokeStyle = ctx.strokeStyle;

            // Dibujar el miembro normal
            ctx.beginPath();
            ctx.strokeStyle = member.type === 'frame' ? frameColor : trussColor;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Si este miembro está seleccionado, dibujarlo resaltado
            if (member.id === selectedMemberId) {
                ctx.lineWidth = 4; // Línea más gruesa para el resaltado
                ctx.strokeStyle = 'yellow'; // Color de resaltado
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                
                // Restablecer para otros miembros
                ctx.lineWidth = originalLineWidth;
                ctx.strokeStyle = originalStrokeStyle;
                ctx.lineCap = 'butt';
            }

            // Draw member label
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(member.label, midX, midY - 5);
        });

        // Draw Nodes (and highlight selected nodes)
        ctx.font = '10px Arial';
        nodes.forEach(node => {
            const canvasNodeX = currentOriginX + node.x * gridSize;
            const canvasNodeY = currentOriginY - node.y * gridSize;

            ctx.beginPath();
            if (selectedNodeId === node.id) {
                // Nodo seleccionado por el usuario
                ctx.fillStyle = 'yellow';
                ctx.strokeStyle = 'orange';
                ctx.lineWidth = 2;
                ctx.arc(canvasNodeX, canvasNodeY, nodeRadius + 2, 0, 2 * Math.PI); // Ligeramente más grande
                ctx.fill();
                ctx.stroke();
            } else if (memberDrawState.active && memberDrawState.firstNode && memberDrawState.firstNode.id === node.id) {
                // Nodo seleccionado para el primer punto de un miembro
                ctx.fillStyle = selectedNodeColor;
                ctx.arc(canvasNodeX, canvasNodeY, nodeRadius, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                // Nodo normal
                ctx.fillStyle = nodeColor;
                ctx.arc(canvasNodeX, canvasNodeY, nodeRadius, 0, 2 * Math.PI);
                ctx.fill();
            }

            // Dibujar rótula si el nodo la tiene
            if (node.hasHinge) {
                // Dibujar un círculo externo para indicar la rótula
                ctx.beginPath();
                ctx.strokeStyle = '#00BFFF'; // Azul claro para la rótula
                ctx.lineWidth = 2;
                ctx.arc(canvasNodeX, canvasNodeY, nodeRadius + 4, 0, 2 * Math.PI);
                ctx.stroke();
                
                // Dibujar un círculo interno con un patrón de rótula
                ctx.beginPath();
                ctx.strokeStyle = '#00BFFF';
                ctx.setLineDash([2, 2]); // Patrón de línea discontinua
                ctx.arc(canvasNodeX, canvasNodeY, nodeRadius + 7, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.setLineDash([]); // Restaurar el patrón de línea continua
            }
            
            // Dibujar la etiqueta del nodo
            ctx.fillStyle = textColor;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            const label = node.label !== undefined ? node.label : node.id;
            // Añadir un indicador de rótula a la etiqueta si el nodo tiene rótula
            const displayLabel = node.hasHinge ? `${label} [R]` : label;
            ctx.fillText(displayLabel, canvasNodeX + nodeRadius + 2, canvasNodeY - nodeRadius - 2);
        });
    }

    // Función para encontrar un nodo en las coordenadas del mouse
    function findNodeAt(x, y) {
        const currentOriginX = originX();
        const currentOriginY = originY();
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            const canvasNodeX = currentOriginX + node.x * gridSize;
            const canvasNodeY = currentOriginY - node.y * gridSize;
            const distance = Math.sqrt(Math.pow(x - canvasNodeX, 2) + Math.pow(y - canvasNodeY, 2));
            if (distance < clickTolerance) {
                return node;
            }
        }
        return null;
    }

    // Función para encontrar una carga distribuida en las coordenadas del mouse
    function findDistributedLoadAt(mouseX, mouseY) {
        const labelClickTolerance = 20; // Tolerancia para detectar clics en etiquetas (en píxeles)
        
        // Buscar entre todas las cargas distribuidas
        for (const load of window.loads) {
            if (load.type !== 'distributed' || !load._renderData) continue;
            
            const data = load._renderData;
            
            // PASO 1: Verificar si se hizo clic en alguna de las etiquetas
            // Las etiquetas están ubicadas cerca de los puntos de inicio y fin, o en el medio
            // Usar los datos guardados de posición de etiquetas
            if (data.labelPositions) {
                for (const labelPos of data.labelPositions) {
                    const distance = Math.sqrt(
                        Math.pow(mouseX - labelPos.x, 2) + 
                        Math.pow(mouseY - labelPos.y, 2)
                    );
                    
                    if (distance < labelClickTolerance) {
                        return load; // Se hizo clic en una etiqueta
                    }
                }
            }
            
            // PASO 2: Verificar si se hizo clic en el área de las flechas
            // Calcular las coordenadas del mouse relativas a la línea de la barra
            const dx = mouseX - data.startX;
            const dy = mouseY - data.startY;
            
            // Rotar las coordenadas del mouse al sistema de coordenadas de la barra
            const rotatedX = dx * Math.cos(-data.angle) - dy * Math.sin(-data.angle);
            const rotatedY = dx * Math.sin(-data.angle) + dy * Math.cos(-data.angle);
            
            // Verificar si el punto está dentro del rango de longitud de la barra (eje X)
            if (rotatedX >= 0 && rotatedX <= data.memberLength) {
                // Determinar dirección y longitud máxima de la carga en este punto
                // Interpolación lineal entre valores de inicio y fin para el punto actual
                const ratio = rotatedX / data.memberLength;
                const startValue = parseFloat(load.startValue);
                const endValue = parseFloat(load.endValue);
                const interpolatedValue = startValue + (endValue - startValue) * ratio;
                
                // Convertir el valor a una longitud de flecha (positiva o negativa)
                const maxArrowLength = Math.abs(interpolatedValue) * 3; // Factor de escala para altura de flecha
                const arrowDirection = interpolatedValue >= 0 ? 1 : -1; // 1 hacia abajo, -1 hacia arriba
                
                // Crear un área AMPLIADA para la detección de clics:
                // - Ahora incluimos todo el área desde muy por encima de las flechas hasta cerca de la barra
                // - Con un margen adicional mucho mayor para facilitar la selección
                const selectionMargin = 50; // Margen mucho más amplio
                const minY = Math.min(0, arrowDirection * maxArrowLength) - selectionMargin;
                const maxY = Math.max(0, arrowDirection * maxArrowLength) + selectionMargin;
                
                // Excluir solamente el área muy cercana a la barra
                const barExclusionMargin = 3; // Margen más pequeño para excluir menos
                if (rotatedY >= minY && rotatedY <= maxY && Math.abs(rotatedY) > barExclusionMargin) {
                    return load;
                }
            }
        }
        
        return null;
    }

    // Función para encontrar un miembro en las coordenadas del mouse
    function findMemberAt(mouseX, mouseY) {
        const currentOriginX = originX();
        const currentOriginY = originY();
        const selectionTolerance = 10; // Píxeles

        for (let i = members.length - 1; i >= 0; i--) {
            const member = members[i];
            const startNode = nodes.find(n => n.id === member.startNodeId);
            const endNode = nodes.find(n => n.id === member.endNodeId);

            if (!startNode || !endNode) continue;

            const x1 = currentOriginX + startNode.x * gridSize;
            const y1 = currentOriginY - startNode.y * gridSize;
            const x2 = currentOriginX + endNode.x * gridSize;
            const y2 = currentOriginY - endNode.y * gridSize;

            // Calcular distancia del punto (mouseX, mouseY) al segmento de línea (x1,y1)-(x2,y2)
            const lenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            if (lenSq === 0) { // El miembro es un punto
                const distToPoint = Math.sqrt(Math.pow(mouseX - x1, 2) + Math.pow(mouseY - y1, 2));
                if (distToPoint < selectionTolerance) return member;
                continue;
            }

            let t = ((mouseX - x1) * (x2 - x1) + (mouseY - y1) * (y2 - y1)) / lenSq;
            t = Math.max(0, Math.min(1, t)); 

            const closestX = x1 + t * (x2 - x1);
            const closestY = y1 + t * (y2 - y1);

            const distance = Math.sqrt(Math.pow(mouseX - closestX, 2) + Math.pow(mouseY - closestY, 2));

            if (distance < selectionTolerance) {
                return member;
            }
        }
        return null;
    }

    // Función para actualizar la visibilidad de los botones de acción
    function updateMemberActionButtonsVisibility() {
        // Botones para miembro seleccionado
        if (selectedMemberId !== null) {
            assignSectionButton.style.display = 'inline-block'; // Solo mostrar botón de asignar sección para miembros
            deleteMemberButton.style.display = 'inline-block';
            deleteMemberButton.title = "Eliminar Miembro";
        } 
        // Botones para nodo seleccionado
        else if (selectedNodeId !== null) {
            assignSectionButton.style.display = 'none'; // No se asignan secciones a nodos
            deleteMemberButton.style.display = 'inline-block';
            deleteMemberButton.title = "Eliminar Nodo";
        }
        // Botones para carga seleccionada
        else if (selectedLoadId !== null) {
            assignSectionButton.style.display = 'none'; // No se asignan secciones a cargas
            deleteMemberButton.style.display = 'inline-block';
            deleteMemberButton.title = "Eliminar Carga";
        }
        // Nada seleccionado
        else {
            assignSectionButton.style.display = 'none';
            deleteMemberButton.style.display = 'none';
        }
    }

    // --- Panning Logic ---
    function handlePanMouseDown(event) {
        if (event.button === 0 && !memberDrawState.active && !isAddingNodeMode) {
            isPanning = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            canvas.style.cursor = 'grabbing';
        }
    }
    // handlePanMouseMove, handlePanMouseUp, handlePanMouseOut remain largely the same but should check modes
    function handlePanMouseMove(event) {
        if (isPanning) {
            const dx = event.clientX - lastMouseX;
            const dy = event.clientY - lastMouseY;
            panX += dx;
            panY += dy;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            updateCanvas();
        }
    }

    function handlePanMouseUp(event) {
        if (event.button === 0) {
            isPanning = false;
            if (!isAddingNodeMode && !memberDrawState.active) {
                canvas.style.cursor = 'grab';
            } else if (isAddingNodeMode) {
                canvas.style.cursor = 'crosshair';
            } else if (memberDrawState.active) {
                canvas.style.cursor = 'pointer'; // Or specific cursor for member drawing
            }
        }
    }

    function handlePanMouseOut() {
        if (isPanning) {
            isPanning = false;
            // Similar cursor logic as mouseup
            if (!isAddingNodeMode && !memberDrawState.active) {
                canvas.style.cursor = 'grab';
            } else if (isAddingNodeMode) {
                canvas.style.cursor = 'crosshair';
            } else if (memberDrawState.active) {
                canvas.style.cursor = 'pointer';
            }
        }
    }

    // --- Add Node Logic ---
    function handleNodeAddMouseDown(event) {
        if (event.button === 0 && isAddingNodeMode) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const currentOriginX = originX();
            const currentOriginY = originY();
            const gridX = Math.round((mouseX - currentOriginX) / gridSize);
            const gridY = Math.round(-(mouseY - currentOriginY) / gridSize);
            const existingNode = nodes.find(n => n.x === gridX && n.y === gridY);
            if (!existingNode) {
                const newNodeId = `N${nextNodeIdCounter}`;
                nodes.push({ 
                    id: newNodeId, 
                    label: `${nextNodeIdCounter}`, 
                    x: gridX, 
                    y: gridY,
                    hasHinge: false // Propiedad para indicar si el nodo tiene rótula
                });
                nextNodeIdCounter++;
                drawGrid();
            } else {
                console.log(`Node already exists at (${gridX}, ${gridY})`);
            }
        }
    }

    // --- Node Editing Modal Logic ---
    function openNodeEditor(node) {
        currentlyEditingNode = node;
        nodeXInput.value = node.x;
        nodeYInput.value = node.y;
        nodeLabelInput.value = node.label !== undefined ? node.label : node.id;
        nodeEditorModal.style.display = 'block';
    }
    function closeNodeEditor() {
        nodeEditorModal.style.display = 'none';
        currentlyEditingNode = null;
    }
    saveNodeChangesButton.addEventListener('click', () => {
        if (currentlyEditingNode) {
            const newX = parseInt(nodeXInput.value, 10);
            const newY = parseInt(nodeYInput.value, 10);
            const newLabel = nodeLabelInput.value.trim();
            if (isNaN(newX) || isNaN(newY)) { alert('Coordinates must be numbers.'); return; }
            if (newLabel === '') { alert('Label cannot be empty.'); return; }
            const conflictingNode = nodes.find(n => n !== currentlyEditingNode && n.x === newX && n.y === newY);
            if (conflictingNode) { alert(`Another node already exists at coordinates (${newX}, ${newY}).`); return; }
            currentlyEditingNode.x = newX;
            currentlyEditingNode.y = newY;
            currentlyEditingNode.label = newLabel;
            closeNodeEditor();
            updateCanvas();
        }
    });
    cancelNodeChangesButton.addEventListener('click', closeNodeEditor);
    closeButtonNodeEditor.addEventListener('click', closeNodeEditor);
    window.addEventListener('click', (event) => {
        if (event.target === nodeEditorModal) closeNodeEditor();
        if (event.target === memberPropertiesModal) {
            memberPropertiesModal.style.display = 'none';
            resetMemberDrawState();
        }
        if (event.target === sectionPropsModal) {
            sectionPropsModal.style.display = 'none';
            // Potentially reset any state related to section props editing if needed here
        }
        if (event.target === assignSectionModal) {
            closeAssignSectionModal();
        }
    });
    
    // --- Canvas Double Click for Node Editing ---
    canvas.addEventListener('dblclick', (event) => {
        if (isAddingNodeMode || memberDrawState.active) return;
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const clickedNode = findNodeAt(mouseX, mouseY);
        
        if (clickedNode) {
            openNodeEditor(clickedNode);
        }
    });

    // --- Member Properties Modal Logic ---
    function openMemberPropertiesModal() {
        memberPropertiesModal.style.display = 'block';
    }
    // function closeMemberPropertiesModal() { ... } // This function will be effectively replaced by direct logic

    addFrameElementButton.addEventListener('click', () => {
        startMemberDrawing('frame');
    });
    addTrussElementButton.addEventListener('click', () => {
        startMemberDrawing('truss');
    });

    // Cancel button in Member Properties Modal
    cancelMemberPropertiesButton.addEventListener('click', () => {
        memberPropertiesModal.style.display = 'none';
        resetMemberDrawState();
    });
    // X button in Member Properties Modal
    closeButtonMemberProps.addEventListener('click', () => {
        memberPropertiesModal.style.display = 'none';
        resetMemberDrawState();
    });

    function startMemberDrawing(type) {
        memberPropertiesModal.style.display = 'none'; // Just hide the modal
        isAddingNodeMode = false; // Ensure other modes are off
        addNodeButton.classList.remove('active');
        addMemberButton.classList.add('active'); // Keep member button active

        memberDrawState.active = true;
        memberDrawState.type = type;
        memberDrawState.selectingStage = 1;
        memberDrawState.firstNode = null;
        canvas.style.cursor = 'pointer'; // Indicate node selection
        console.log(`Starting to draw ${type} member. Select first node.`);
    }

    function resetMemberDrawState() {
        console.log(`%cresetMemberDrawState: Called. Current state - isAddingNodeMode: ${isAddingNodeMode}, memberDrawState.active: ${memberDrawState.active}, memberDrawState.selectingStage: ${memberDrawState.selectingStage}`, 'color: orange');
        console.log(`%cresetMemberDrawState: Before remove, addMemberButton active: ${addMemberButton.classList.contains('active')}`, 'color: orange');
        addMemberButton.classList.remove('active'); // Always deactivate member button
        console.log(`%cresetMemberDrawState: After remove, addMemberButton active: ${addMemberButton.classList.contains('active')}`, 'color: orange');

        memberDrawState.active = false;
        memberDrawState.type = null;
        memberDrawState.firstNode = null;
        memberDrawState.selectingStage = 0;

        addMemberButton.classList.remove('active'); // Always deactivate member button

        // Determine overall UI state (cursor, other buttons) based on isAddingNodeMode
        if (isAddingNodeMode) {
            // If Add Node mode is supposed to be active, ensure its UI is primary
            if (!addNodeButton.classList.contains('active')) { // Defensive check
                addNodeButton.classList.add('active');
            }
            canvas.style.cursor = 'crosshair';
        } else {
            // Not in Add Node mode, and member mode just got reset. So, pan/idle mode.
            if (addNodeButton.classList.contains('active')) { // Defensive check
                addNodeButton.classList.remove('active');
            }
            canvas.style.cursor = 'grab';
        }
        updateCanvas(); // Redraw to remove any member-selection highlights
    }

    // --- Main Canvas Click Handler (for adding nodes AND members) ---
    // Función para abrir el modal de editar carga distribuida
    function openEditDistLoadModal(load) {
        if (!load || load.type !== 'distributed') {
            console.error('No se puede editar: la carga no es de tipo distribuida o es nula');
            return;
        }
        
        // Guardar la ID de la carga que se está editando
        currentEditingLoadId = load.id;
        
        // Poblar los inputs con los valores actuales
        editStartLoadInput.value = load.startValue;
        editEndLoadInput.value = load.endValue;
        
        // Mostrar el modal
        editDistLoadModal.style.display = 'block';
    }
    
    // Función para cerrar el modal de editar carga distribuida
    function closeEditDistLoadModal() {
        editDistLoadModal.style.display = 'none';
        currentEditingLoadId = null;
    }
    
    // Event listeners para los botones del modal de carga distribuida
    if (closeEditDistLoadButton) {
        closeEditDistLoadButton.addEventListener('click', closeEditDistLoadModal);
    }
    
    if (cancelEditDistLoadButton) {
        cancelEditDistLoadButton.addEventListener('click', closeEditDistLoadModal);
    }
    
    if (saveEditDistLoadButton) {
        saveEditDistLoadButton.addEventListener('click', () => {
            if (!currentEditingLoadId) {
                console.error('No hay carga seleccionada para editar');
                closeEditDistLoadModal();
                return;
            }
            
            // Buscar la carga en el array de cargas
            const loadIndex = window.loads.findIndex(load => load.id === currentEditingLoadId);
            if (loadIndex === -1) {
                console.error('Carga no encontrada en el array de cargas');
                closeEditDistLoadModal();
                return;
            }
            
            // Actualizar los valores de la carga - asegurarse de convertir a números
            window.loads[loadIndex].startValue = parseFloat(editStartLoadInput.value);
            window.loads[loadIndex].endValue = parseFloat(editEndLoadInput.value);
            
            // Eliminar los datos de renderizado anteriores para forzar un nuevo cálculo
            delete window.loads[loadIndex]._renderData;
            
            console.log('Carga distribuida actualizada:', window.loads[loadIndex]);
            
            // Cerrar el modal y actualizar el canvas
            closeEditDistLoadModal();
            updateCanvas();
        });
    }
    
    // Event listener para cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === editDistLoadModal) {
            closeEditDistLoadModal();
        }
    });
    
    // Manejador de doble clic en el canvas
    canvas.addEventListener('dblclick', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        // Verificar si se hizo doble clic en una carga distribuida
        const clickedLoad = findDistributedLoadAt(mouseX, mouseY);
        if (clickedLoad) {
            console.log('Doble clic en carga distribuida:', clickedLoad.id);
            openEditDistLoadModal(clickedLoad);
        }
    });
    
    // Función para encontrar una carga distribuida en una posición específica del canvas
    function findDistributedLoadAt(x, y) {
        // Si no hay cargas, retornar null inmediatamente
        if (!window.loads || window.loads.length === 0) {
            return null;
        }
        
        // Obtener las coordenadas del canvas
        const currentOriginX = originX();
        const currentOriginY = originY();
        
        // Tolerancia para el clic (en píxeles)
        const clickTolerance = 20; // Aumentar tolerancia para mayor facilidad de selección
        
        // Array para almacenar cargas candidatas y sus distancias al clic
        const candidates = [];
        
        // Verificar cada carga distribuida
        for (let i = 0; i < window.loads.length; i++) {
            const load = window.loads[i];
            if (load.type !== 'distributed') continue;
            
            // Encontrar el miembro asociado a esta carga
            const member = members.find(m => m.id === load.memberId);
            if (!member) continue;
            
            // Obtener los nodos de inicio y fin
            const startNode = nodes.find(n => n.id === member.startNodeId);
            const endNode = nodes.find(n => n.id === member.endNodeId);
            if (!startNode || !endNode) continue;
            
            // Convertir coordenadas de los nodos a coordenadas del canvas
            const startX = currentOriginX + startNode.x * gridSize;
            const startY = currentOriginY - startNode.y * gridSize;
            const endX = currentOriginX + endNode.x * gridSize;
            const endY = currentOriginY - endNode.y * gridSize;
            
            // Calcular la posición real de la carga en la barra basándonos en startDistance y endDistance
            const memberLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const angle = Math.atan2(endY - startY, endX - startX);
            
            // Calcular los puntos de inicio y fin reales de la carga, considerando los valores de distancia
            const startDistVal = load.startDistance !== undefined ? load.startDistance : 0;
            const endDistVal = load.endDistance !== undefined ? load.endDistance : 1;
            
            // Calcular posiciones en coordenadas del canvas para el inicio y fin de la carga
            const loadStartX = startX + (endX - startX) * startDistVal;
            const loadStartY = startY + (endY - startY) * startDistVal;
            const loadEndX = startX + (endX - startX) * endDistVal;
            const loadEndY = startY + (endY - startY) * endDistVal;
            
            // Calcular el punto medio de esta carga específica (no del miembro completo)
            const loadMidX = loadStartX + (loadEndX - loadStartX) / 2;
            const loadMidY = loadStartY + (loadEndY - loadStartY) / 2;
            
            // Puntuaciones para determinar si esta carga es la más cercana al clic
            let minDistance = Infinity;
            let hitScore = 0;
            
            // 1. Verificar si el clic está cerca de las etiquetas de la carga
            const isConstantLoad = Math.abs(Math.abs(load.startValue) - Math.abs(load.endValue)) < 0.001;
            
            if (isConstantLoad) {
                // Para cargas constantes, verificar la distancia al punto medio de esta carga
                const distanceToMid = Math.sqrt(Math.pow(x - loadMidX, 2) + Math.pow(y - loadMidY, 2));
                if (distanceToMid <= clickTolerance * 2) { // Tolerancia ampliada para etiquetas
                    minDistance = Math.min(minDistance, distanceToMid);
                    hitScore += 100; // Alta prioridad a los clics en etiquetas
                }
            } else {
                // Para cargas variables, verificar la distancia a las etiquetas de inicio y fin
                const distanceToStartLabel = Math.sqrt(Math.pow(x - loadStartX, 2) + Math.pow(y - loadStartY, 2));
                const distanceToEndLabel = Math.sqrt(Math.pow(x - loadEndX, 2) + Math.pow(y - loadEndY, 2));
                
                if (distanceToStartLabel <= clickTolerance * 1.5) {
                    minDistance = Math.min(minDistance, distanceToStartLabel);
                    hitScore += 100;
                }
                if (distanceToEndLabel <= clickTolerance * 1.5) {
                    minDistance = Math.min(minDistance, distanceToEndLabel);
                    hitScore += 100;
                }
            }
            
            // 2. Verificar si el clic está cerca de la línea de la carga
            // Calcular la proyección del clic sobre la línea del miembro
            const t = ((x - startX) * (endX - startX) + (y - startY) * (endY - startY)) / (memberLength * memberLength);
            
            // Verificar que la proyección está dentro del rango de esta carga específica (basado en distancias)
            if (t >= startDistVal - 0.05 && t <= endDistVal + 0.05) { // Tolerancia de 5% para mejor selección
                const projX = startX + t * (endX - startX);
                const projY = startY + t * (endY - startY);
                const distanceToLine = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
                
                if (distanceToLine <= clickTolerance) {
                    minDistance = Math.min(minDistance, distanceToLine);
                    hitScore += 50; // Menor prioridad que las etiquetas
                }
            }
            
            // 3. Verificar si el clic está cerca de alguna de las flechas (esto es una aproximación)
            // Como las flechas están en el rango entre loadStartX y loadEndX, verificamos todo ese rango
            if (t >= startDistVal - 0.1 && t <= endDistVal + 0.1) { // Tolerancia ampliada para las flechas
                const projX = startX + t * (endX - startX);
                const projY = startY + t * (endY - startY);
                
                // Considerar la altura vertical de las flechas
                const maxArrowHeight = 40; // aproximación de la altura máxima que pueden tener las flechas
                const verticalDistance = Math.abs(Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2)));
                
                if (verticalDistance <= maxArrowHeight) {
                    minDistance = Math.min(minDistance, verticalDistance);
                    hitScore += 30; // Menor prioridad que la línea y las etiquetas
                }
            }
            
            // Si detectamos algún tipo de hit, añadir esta carga como candidata
            if (hitScore > 0 && minDistance < Infinity) {
                candidates.push({
                    load: load,
                    distance: minDistance,
                    score: hitScore
                });
            }
        }
        
        // Si no hay candidatos, retornar null
        if (candidates.length === 0) {
            return null;
        }
        
        // Ordenar candidatos por score (mayor a menor) y luego por distancia (menor a mayor)
        candidates.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score; // Mayor score primero
            }
            return a.distance - b.distance; // Menor distancia primero si los scores son iguales
        });
        
        // Retornar la carga del mejor candidato
        console.log('Candidatos encontrados para selección:', candidates.length);
        console.log('Seleccionando carga:', candidates[0].load.id);
        return candidates[0].load;
    }
    
    canvas.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return; // Only left click

        if (isAddingNodeMode) {
            handleNodeAddMouseDown(event);
        } else if (memberDrawState.active) {
            handleMemberNodeSelection(event);
        } else if (loadDrawState.active) {
            // Si estamos en modo de carga, manejar con la función específica
            handleLoadModeMouseDown(event);
        } else {
            // Selección normal de nodos, miembros y cargas
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            // Guardar selecciones anteriores para comparar después
            const previousSelectedMemberId = selectedMemberId;
            const previousSelectedNodeId = selectedNodeId;
            const previousSelectedLoadId = selectedLoadId;
            
            // Resetear selecciones
            selectedMemberId = null;
            selectedNodeId = null;
            selectedLoadId = null;
            
            // Verificar primero si se hizo clic en un nodo (prioridad más alta)
            const clickedNode = findNodeAt(mouseX, mouseY);
            if (clickedNode) {
                selectedNodeId = clickedNode.id;
                console.log('Nodo seleccionado:', clickedNode.label || clickedNode.id);
            } 
            // Si no se hizo clic en un nodo, verificar si se hizo clic en una carga distribuida
            else {
                const clickedLoad = findDistributedLoadAt(mouseX, mouseY);
                if (clickedLoad) {
                    selectedLoadId = clickedLoad.id;
                    console.log('Carga distribuida seleccionada:', clickedLoad.id);
                }
                // Si no se hizo clic en una carga, verificar si se hizo clic en un miembro
                else {
                    const clickedMember = findMemberAt(mouseX, mouseY);
                    if (clickedMember) {
                        selectedMemberId = clickedMember.id;
                        console.log('Miembro seleccionado:', clickedMember.label);
                    }
                }
            }
            
            // Actualizar la interfaz de usuario si cambió la selección
            if (previousSelectedMemberId !== selectedMemberId || 
                previousSelectedNodeId !== selectedNodeId || 
                previousSelectedLoadId !== selectedLoadId) {
                    
                // Actualizar visibilidad de botones de acción
                updateMemberActionButtonsVisibility();
                // Redibujar para mostrar el resaltado
                updateCanvas();
            }
            
            // Si no se hizo clic en un miembro, nodo o carga, iniciar el pan
            if (!clickedNode && !selectedMemberId && !selectedLoadId) {
                handlePanMouseDown(event);
            }
        }
    });

    function handleMemberNodeSelection(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const currentOriginX = originX();
        const currentOriginY = originY();

        let clickedNode = null;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            const canvasNodeX = currentOriginX + node.x * gridSize;
            const canvasNodeY = currentOriginY - node.y * gridSize;
            const distance = Math.sqrt(Math.pow(mouseX - canvasNodeX, 2) + Math.pow(mouseY - canvasNodeY, 2));
            if (distance < clickTolerance) {
                clickedNode = node;
                break;
            }
        }

        if (!clickedNode) return; // Click was not on a node

        if (memberDrawState.selectingStage === 1) {
            memberDrawState.firstNode = clickedNode;
            memberDrawState.selectingStage = 2;
            console.log(`First node ${clickedNode.label} selected. Select second node.`);
            updateCanvas(); // Redraw to highlight first node
        } else if (memberDrawState.selectingStage === 2) {
            if (clickedNode.id === memberDrawState.firstNode.id) {
                console.log('Cannot connect a node to itself.');
                return;
            }
            // Check if member already exists
            const memberExists = members.some(m => 
                (m.startNodeId === memberDrawState.firstNode.id && m.endNodeId === clickedNode.id) ||
                (m.startNodeId === clickedNode.id && m.endNodeId === memberDrawState.firstNode.id)
            );
            if (memberExists) {
                console.log('Member already exists between these nodes.');
                resetMemberDrawState();
                return;
            }

            let newMemberLabel = '';
            if (memberDrawState.type === 'frame') {
                newMemberLabel = `F${nextFrameIdCounter++}`;
            } else if (memberDrawState.type === 'truss') {
                newMemberLabel = `T${nextTrussIdCounter++}`;
            }

            members.push({
                id: Date.now(), // Agregar un ID único basado en timestamp
                startNodeId: memberDrawState.firstNode.id,
                endNodeId: clickedNode.id,
                type: memberDrawState.type,
                label: newMemberLabel
            });
            console.log(`${memberDrawState.type} member ${newMemberLabel} added between ${memberDrawState.firstNode.label} and ${clickedNode.label}.`);
            resetMemberDrawState(); // Resets active, type, firstNode, stage, cursor
        }
    }

    // --- Toolbar Button Event Listeners ---
    if (addNodeButton) {
        addNodeButton.addEventListener('click', toggleAddNodesMode);
    }

    if (addMemberButton) {
        addMemberButton.addEventListener('click', () => {
            // Case 1: Actively selecting member nodes (stage 1 or 2). Clicking button re-opens modal.
            if (memberDrawState.active && memberDrawState.selectingStage > 0) {
                console.log('addMemberButton listener (Case 1): Actively selecting. Re-opening modal.');
                openMemberPropertiesModal(); // Modal appears, button remains active.
                return; // Exit after handling Case 1
            }

            // Case 2: Modal is currently open (implies stage 0 as per Case 1 check). 
            // Clicking button closes modal & deactivates member mode.
            else if (memberPropertiesModal.style.display === 'block') { // Changed to 'else if'
                console.log('addMemberButton listener (Case 2): Modal is open. Closing modal and resetting state.');
                memberPropertiesModal.style.display = 'none';
                resetMemberDrawState(); // This deactivates addMemberButton and sets cursor.
                return; // Exit after handling Case 2
            }
            // Case 3: Modal is closed (and not actively selecting members as per Case 1).
            // Clicking button opens modal & activates member mode.
            else {
                console.log('addMemberButton listener (Case 3): Modal is closed. Opening modal and activating member mode.');
                isAddingNodeMode = false;             // Turn off Add Node mode
                addNodeButton.classList.remove('active'); // Deactivate Add Node button

                console.log(`%caddMemberButton listener (Case 3): Before add, active: ${addMemberButton.classList.contains('active')}`, 'color: lightblue');
                addMemberButton.classList.add('active');  // Activate Add Member button
                console.log(`%caddMemberButton listener (Case 3): After add, active: ${addMemberButton.classList.contains('active')}`, 'color: lightblue');
                openMemberPropertiesModal();              // Show modal
                canvas.style.cursor = 'default';        // Interaction is with modal, so default cursor.
            }
        });
    }

    // --- Section Properties Modal Basic Show/Hide --- 
    if (sectionPropertiesButton) {
        sectionPropertiesButton.addEventListener('click', () => {
            // When opening section properties, the member properties modal can be hidden
            // or kept open based on desired UX. For now, let's hide it to focus on section props.
            if (memberPropertiesModal.style.display === 'block') {
                 memberPropertiesModal.style.display = 'none';
                 // Note: resetMemberDrawState will deactivate addMemberButton and set cursor correctly based on isAddingNodeMode.
                 // If it should, then resetMemberDrawState() needs to be called.
            }
            sectionPropsModal.style.display = 'block';
        });
    }

    if (closeSectionPropsModalButton) {
        closeSectionPropsModalButton.addEventListener('click', () => {
            sectionPropsModal.style.display = 'none';
            // Potentially reset any state related to section props editing if needed here
        });
    }

    // --- Section Properties List Management ---
    let nextSectionPropertyId = 2; // Start after '1DEFAULT'

    if (addNewSectionPropertyButton) {
        addNewSectionPropertyButton.addEventListener('click', () => {
            const newPropertyName = `${nextSectionPropertyId}NEW_SECTION`;
            const newPropertyId = `section-${nextSectionPropertyId}`;

            // Add to data store with default values
            sectionPropertiesData[newPropertyId] = {
                name: newPropertyName,
                modulusElasticity: 200, // Default GPa
                unitWeight: 0,          // Default kN/m3
                thermalCoefficient: 0,  // Default 1/°C
                area: 0.01,             // Default m2
                inertia: 50             // Default cm4
            };

            nextSectionPropertyId++;
            populateSectionPropertyList(); // Refresh the entire list
            console.log(`Added new section property: ${newPropertyId} (Name: ${newPropertyName})`);
        });
    }

    // Populate section property list
    function populateSectionPropertyList() {
        sectionPropertyListUL.innerHTML = ''; // Clear existing items
        Object.keys(sectionPropertiesData).forEach(id => {
            const section = sectionPropertiesData[id];
            const listItem = document.createElement('li');
            listItem.setAttribute('data-id', id);
            // Always include the delete button; its click handler will manage restrictions for 'default'
            listItem.innerHTML = `
                <span>${section.name}</span>
                <div>
                    <button class="configure-section-button" title="Configure section">&#x2699;</button>
                    <button class="delete-section-button" title="Delete section">&#x1F5D1;</button>
                </div>
            `;

            const configureBtn = listItem.querySelector('.configure-section-button');
            if (configureBtn) {
                configureBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditSectionModal(id);
                });
            }

            const deleteBtn = listItem.querySelector('.delete-section-button');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (id === 'default') { // Explicit check for default before confirm
                        alert('The DEFAULT section property cannot be deleted.');
                        return;
                    }
                    if (confirm(`Are you sure you want to delete section: ${section.name}?`)) {
                        listItem.remove();
                        delete sectionPropertiesData[id];
                        console.log(`Deleted section property: ${id}`);
                    }
                });
            }
            sectionPropertyListUL.appendChild(listItem);
        });
    }

    // --- Edit Section Modal Functions (New) ---
    function openEditSectionModal(sectionId) {
        currentlyEditingSectionId = sectionId;
        const sectionData = sectionPropertiesData[sectionId];
        if (!sectionData) {
            console.error('Section data not found for ID:', sectionId);
            alert('Error: No se encontraron datos para esta sección.');
            return;
        }

        editSectionNameInput.value = sectionData.name;
        editModulusElasticityInput.value = sectionData.modulusElasticity;
        editUnitWeightInput.value = sectionData.unitWeight;
        editThermalCoefficientInput.value = sectionData.thermalCoefficient;
        editAreaInput.value = sectionData.area;
        editInertiaInput.value = sectionData.inertia;

        editSectionModal.style.display = 'block';
    }

    function closeEditSectionModal() {
        editSectionModal.style.display = 'none';
        currentlyEditingSectionId = null;
    }

    function saveEditSectionDetails() {
        if (!currentlyEditingSectionId) return;

        const sectionData = sectionPropertiesData[currentlyEditingSectionId];
        if (!sectionData) {
            console.error('Section data not found for saving, ID:', currentlyEditingSectionId);
            alert('Error: No se pudieron guardar los cambios.');
            return;
        }

        const oldName = sectionData.name;
        const newName = editSectionNameInput.value.trim();

        if (!newName) {
            alert('El nombre de la sección no puede estar vacío.');
            return;
        }

        // Check for duplicate names (excluding the current section being edited)
        for (const id in sectionPropertiesData) {
            if (id !== currentlyEditingSectionId && sectionPropertiesData[id].name === newName) {
                alert(`El nombre de sección "${newName}" ya existe. Por favor elija otro nombre.`);
                return;
            }
        }

        sectionData.name = newName;
        sectionData.modulusElasticity = parseFloat(editModulusElasticityInput.value) || 0;
        sectionData.unitWeight = parseFloat(editUnitWeightInput.value) || 0;
        sectionData.thermalCoefficient = parseFloat(editThermalCoefficientInput.value) || 0;
        sectionData.area = parseFloat(editAreaInput.value) || 0;
        sectionData.inertia = parseFloat(editInertiaInput.value) || 0;

        // Update the name in the section properties list if it changed
        if (oldName !== newName) {
            const listItem = sectionPropertyListUL.querySelector(`li[data-id="${currentlyEditingSectionId}"] span`);
            if (listItem) {
                listItem.textContent = newName;
            }
        }
        console.log('Updated section details:', sectionPropertiesData[currentlyEditingSectionId]);
        closeEditSectionModal();
    }

    // Event listeners for Edit Section Modal
    if (closeEditSectionModalButton) {
        closeEditSectionModalButton.addEventListener('click', closeEditSectionModal);
    }
    if (saveSectionDetailChangesButton) {
        saveSectionDetailChangesButton.addEventListener('click', saveEditSectionDetails);
    }
    if (cancelSectionDetailChangesButton) {
        cancelSectionDetailChangesButton.addEventListener('click', closeEditSectionModal);
    }

    // --- Funciones para el modal de asignación de sección ---
    function populateAvailableSectionsDropdown() {
        availableSectionsDropdown.innerHTML = ''; // Limpiar opciones existentes
        if (!sectionPropertiesData || Object.keys(sectionPropertiesData).length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No hay secciones definidas";
            option.disabled = true;
            availableSectionsDropdown.appendChild(option);
            confirmAssignSectionButton.disabled = true; 
        } else {
            for (const sectionId in sectionPropertiesData) {
                const section = sectionPropertiesData[sectionId];
                const option = document.createElement('option');
                option.value = sectionId; 
                option.textContent = section.name;
                availableSectionsDropdown.appendChild(option);
            }
            confirmAssignSectionButton.disabled = false;
        }
    }

    function openAssignSectionModal() {
        if (selectedMemberId === null) {
            console.warn("Intento de abrir modal de asignación de sección, pero no hay miembro seleccionado.");
            return;
        }
        populateAvailableSectionsDropdown();
        assignSectionModal.style.display = 'block';
    }

    function closeAssignSectionModal() {
        assignSectionModal.style.display = 'none';
    }
    
    // Funciones para el modal de tipo de carga
    function openLoadTypeModal() {
        loadTypeModal.style.display = 'block';
    }
    
    function closeLoadTypeModal() {
        loadTypeModal.style.display = 'none';
    }
    
    // Función para manejar eventos del canvas cuando estamos en modo de carga
    function handleLoadModeMouseDown(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        if ((loadDrawState.type === 'pointMember' || loadDrawState.type === 'distributed' || loadDrawState.type === 'moment') && loadDrawState.selectingStage === 1) {
            // Buscar si se hizo clic en un miembro
            const clickedMember = findMemberAt(mouseX, mouseY);
            
            if (clickedMember) {
                console.log('Se seleccionó una barra para la carga:', clickedMember.label);
                
                // Guardar el miembro seleccionado para la carga
                loadDrawState.selectedMemberId = clickedMember.id;
                
                // Resaltar visualmente el miembro seleccionado
                selectedMemberId = clickedMember.id;
                drawGrid();
                
                // Desactivar el modo de selección
                loadDrawState.selectingStage = 2; // Etapa completada
                
                // Abrir el modal correspondiente según el tipo de carga
                if (loadDrawState.type === 'pointMember') {
                    openPointLoadMemberModal();
                } else if (loadDrawState.type === 'distributed') {
                    openDistributedLoadModal();
                } else if (loadDrawState.type === 'moment') {
                    openMomentLoadModal();
                }
            } else {
                console.log('No se seleccionó ninguna barra. Haga clic en una barra existente.');
            }
        } else if (loadDrawState.type === 'pointNode' && loadDrawState.selectingStage === 1) {
            // Buscar si se hizo clic en un nodo
            const clickedNode = findNodeAt(mouseX, mouseY);
            
            if (clickedNode) {
                console.log('Se seleccionó un nodo para la carga:', clickedNode.label || clickedNode.id);
                
                // Guardar el nodo seleccionado para la carga
                loadDrawState.selectedNodeId = clickedNode.id;
                
                // Resaltar visualmente el nodo seleccionado
                selectedNodeId = clickedNode.id;
                drawGrid();
                
                // Desactivar el modo de selección
                loadDrawState.selectingStage = 2; // Etapa completada
                
                // Abrir el modal de carga puntual en el nodo
                openPointLoadNodeModal();
            } else {
                console.log('No se seleccionó ningún nodo. Haga clic en un nodo existente.');
            }
        }
    }
    
    // Funciones para el modal de carga puntual sobre la barra
    function openPointLoadMemberModal() {
        pointLoadMemberModal.style.display = 'block';
        updateAngleMarker(90); // Valor inicial de 90 grados
        
        // Obtener el miembro seleccionado
        const selectedMember = members.find(m => m.id === loadDrawState.selectedMemberId);
        if (selectedMember) {
            // Obtener los nodos de inicio y fin
            const startNode = nodes.find(n => n.id === selectedMember.startNodeId);
            const endNode = nodes.find(n => n.id === selectedMember.endNodeId);
            
            if (startNode && endNode) {
                // Calcular la longitud del miembro
                const memberLength = Math.sqrt(
                    Math.pow(endNode.x - startNode.x, 2) + 
                    Math.pow(endNode.y - startNode.y, 2)
                );
                
                // Establecer el máximo del input a la longitud del miembro
                loadDistanceInput.max = memberLength.toFixed(2);
                // Iniciar con un valor por defecto (mitad de la barra)
                loadDistanceInput.value = (memberLength / 2).toFixed(2);
                
                console.log(`Longitud del miembro: ${memberLength.toFixed(2)} unidades`);
            }
        }
    }
    
    function closePointLoadMemberModal() {
        pointLoadMemberModal.style.display = 'none';
    }
    
    // Funciones para el modal de carga puntual en el nodo
    function openPointLoadNodeModal() {
        pointLoadNodeModal.style.display = 'block';
        updateNodeAngleMarker(90); // Valor inicial
    }
    
    function closePointLoadNodeModal() {
        pointLoadNodeModal.style.display = 'none';
    }
    
    // Funciones para el modal de carga de momento
    function openMomentLoadModal() {
        // Inicializar el valor por defecto
        momentLoadModal.style.display = 'block';
        momentLoadInput.value = '50';
        
        // Por defecto, no seleccionar ninguna dirección
        clockwiseButton.classList.remove('active');
        counterClockwiseButton.classList.remove('active');
    }
    
    function closeMomentLoadModal() {
        momentLoadModal.style.display = 'none';
    }
    
    // Event listeners para los botones del modal de carga de momento
    if (closeMomentLoadButton) {
        closeMomentLoadButton.addEventListener('click', () => {
            closeMomentLoadModal();
            resetLoadDrawState();
        });
    }
    
    if (cancelMomentLoadButton) {
        cancelMomentLoadButton.addEventListener('click', () => {
            closeMomentLoadModal();
            resetLoadDrawState();
        });
    }
    
    // Event listeners para los botones de dirección (horario/antihorario)
    if (clockwiseButton) {
        clockwiseButton.addEventListener('click', () => {
            clockwiseButton.classList.add('active');
            counterClockwiseButton.classList.remove('active');
        });
    }
    
    if (counterClockwiseButton) {
        counterClockwiseButton.addEventListener('click', () => {
            counterClockwiseButton.classList.add('active');
            clockwiseButton.classList.remove('active');
        });
    }
    
    // Event listener para el botón momentLoadButton
    if (momentLoadButton) {
        momentLoadButton.addEventListener('click', () => {
            closeLoadTypeModal();
            loadDrawState.active = true;
            loadDrawState.type = 'moment';
            loadDrawState.selectingStage = 1;
            canvas.style.cursor = 'pointer';
            console.log('Modo de carga de momento activado. Seleccione una barra.');
        });
    }
    
    // Funciones para el modal de carga distribuida
    function openDistributedLoadModal() {
        distributedLoadModal.style.display = 'block';
        
        // Calcular la longitud real del miembro seleccionado (en metros)
        const selectedMember = members.find(m => m.id === loadDrawState.selectedMemberId);
        if (selectedMember) {
            // Encontrar los nodos del miembro
            const startNode = nodes.find(n => n.id === selectedMember.startNodeId);
            const endNode = nodes.find(n => n.id === selectedMember.endNodeId);
            
            if (startNode && endNode) {
                // Calcular la distancia entre los nodos (en metros)
                const dx = endNode.x - startNode.x;
                const dy = endNode.y - startNode.y;
                const memberLengthMeters = Math.sqrt(dx*dx + dy*dy);
                
                // Guardar la longitud del miembro en el estado de dibujo de carga
                loadDrawState.memberLengthMeters = memberLengthMeters;
                console.log('Longitud del miembro seleccionado:', memberLengthMeters, 'metros');
                
                // Actualizar los atributos max de los inputs de distancia
                const startDistanceInput = document.getElementById('startDistanceInput');
                const endDistanceInput = document.getElementById('endDistanceInput');
                
                // Para cargas externas, usar la proyección horizontal como distancia máxima
                // Para otros tipos de carga, usar la longitud real del miembro
                let maxDistance = memberLengthMeters;
                
                // Verificar si el botón de carga externa está activo
                const externalLoadButton = document.getElementById('externalLoad');
                const isExternalLoadActive = externalLoadButton && externalLoadButton.classList.contains('active');
                
                // Si es carga externa, calcular la proyección horizontal
                if (isExternalLoadActive) {
                    // Calcular la proyección horizontal del miembro
                    const dx = Math.abs(endNode.x - startNode.x);
                    maxDistance = dx; // Proyección horizontal en metros
                    console.log('Usando proyección horizontal como distancia máxima:', maxDistance, 'metros');
                }
                
                if (startDistanceInput) {
                    startDistanceInput.setAttribute('max', maxDistance.toFixed(2));
                    startDistanceInput.setAttribute('title', `Valor máximo: ${maxDistance.toFixed(2)} metros`);
                }
                
                if (endDistanceInput) {
                    endDistanceInput.setAttribute('max', maxDistance.toFixed(2));
                    endDistanceInput.setAttribute('title', `Valor máximo: ${maxDistance.toFixed(2)} metros`);
                }
            }
        }
        
        // Establecer valores predeterminados
        const startLoadInput = document.getElementById('startLoadInput');
        const endLoadInput = document.getElementById('endLoadInput');
        const startDistanceInput = document.getElementById('startDistanceInput');
        const endDistanceInput = document.getElementById('endDistanceInput');
        
        if (startLoadInput) startLoadInput.value = '10';
        if (endLoadInput) endLoadInput.value = '10';
        if (startDistanceInput) startDistanceInput.value = '0';
        if (endDistanceInput && loadDrawState.memberLengthMeters) {
            endDistanceInput.value = loadDrawState.memberLengthMeters.toFixed(2);
        } else if (endDistanceInput) {
            endDistanceInput.value = '1';
        }
        
        // Establecer el botón 'Perpendicular a la estructura' como activo por defecto
        const loadTypeButtons = document.querySelectorAll('.load-type-button');
        loadTypeButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        const perpendicularLoadButton = document.getElementById('perpendicularLoad');
        if (perpendicularLoadButton) {
            perpendicularLoadButton.classList.add('active');
        }
        
        // Agregar event listeners para los botones de tipo de carga
        const perpendicularLoad = document.getElementById('perpendicularLoad');
        const linearXLoad = document.getElementById('linearXLoad');
        const externalLoad = document.getElementById('externalLoad');
        const axialLoad = document.getElementById('axialLoad');
        
        // Función para manejar el clic en botones de tipo de carga
        function handleLoadTypeButtonClick(event) {
            // Desactivar todos los botones de tipo de carga
            loadTypeButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // Activar solo el botón que fue clickeado
            event.target.classList.add('active');
            
            // Recalcular valores máximos para los inputs de distancia cuando cambia el tipo de carga
            const startDistanceInput = document.getElementById('startDistanceInput');
            const endDistanceInput = document.getElementById('endDistanceInput');
            
            // Si se seleccionó el tipo 'carga externa', calcular la proyección horizontal
            if (event.target.id === 'externalLoad' && loadDrawState.memberLengthMeters) {
                // Obtener el miembro seleccionado
                const selectedMember = members.find(m => m.id === loadDrawState.selectedMemberId);
                if (selectedMember) {
                    // Obtener los nodos del miembro
                    const startNode = nodes.find(n => n.id === selectedMember.startNodeId);
                    const endNode = nodes.find(n => n.id === selectedMember.endNodeId);
                    
                    if (startNode && endNode) {
                        // Calcular la proyección horizontal
                        const dx = Math.abs(endNode.x - startNode.x);
                        
                        // Actualizar los atributos max de los inputs
                        if (startDistanceInput) {
                            startDistanceInput.setAttribute('max', dx.toFixed(2));
                            startDistanceInput.setAttribute('title', `Valor máximo: ${dx.toFixed(2)} metros`);
                        }
                        
                        if (endDistanceInput) {
                            endDistanceInput.setAttribute('max', dx.toFixed(2));
                            endDistanceInput.setAttribute('title', `Valor máximo: ${dx.toFixed(2)} metros`);
                            // Establecer el valor por defecto al máximo de proyección horizontal
                            endDistanceInput.value = dx.toFixed(2);
                        }
                        
                        console.log('Tipo de carga cambiado a External: usando proyección horizontal', dx, 'metros');
                    }
                }
            } else if (loadDrawState.memberLengthMeters) {
                // Para otros tipos de carga, usar la longitud total del miembro
                if (startDistanceInput) {
                    startDistanceInput.setAttribute('max', loadDrawState.memberLengthMeters.toFixed(2));
                    startDistanceInput.setAttribute('title', `Valor máximo: ${loadDrawState.memberLengthMeters.toFixed(2)} metros`);
                }
                
                if (endDistanceInput) {
                    endDistanceInput.setAttribute('max', loadDrawState.memberLengthMeters.toFixed(2));
                    endDistanceInput.setAttribute('title', `Valor máximo: ${loadDrawState.memberLengthMeters.toFixed(2)} metros`);
                    // Establecer el valor por defecto a la longitud total del miembro
                    endDistanceInput.value = loadDrawState.memberLengthMeters.toFixed(2);
                }
                
                console.log('Tipo de carga cambiado: usando longitud total', loadDrawState.memberLengthMeters, 'metros');
            }
        }
        
        // Asignar el event listener a cada botón
        if (perpendicularLoad) perpendicularLoad.addEventListener('click', handleLoadTypeButtonClick);
        if (linearXLoad) linearXLoad.addEventListener('click', handleLoadTypeButtonClick);
        if (externalLoad) externalLoad.addEventListener('click', handleLoadTypeButtonClick);
        if (axialLoad) axialLoad.addEventListener('click', handleLoadTypeButtonClick);
    }
    
    function closeDistributedLoadModal() {
        distributedLoadModal.style.display = 'none';
    }
    
    // Función para guardar la carga distribuida
    function saveDistributedLoad() {
        console.log('Función saveDistributedLoad llamada');
        
        try {
            // Obtener los valores del formulario para las cargas
            const startLoadInputValue = document.getElementById('startLoadInput').value;
            const endLoadInputValue = document.getElementById('endLoadInput').value;
            
            // Obtener los valores del formulario para las distancias
            const startDistanceInputValue = document.getElementById('startDistanceInput').value;
            const endDistanceInputValue = document.getElementById('endDistanceInput').value;
            
            // Usar isNaN para verificar si los valores son números válidos, incluyendo cero
            const startLoadValue = !isNaN(parseFloat(startLoadInputValue)) ? parseFloat(startLoadInputValue) : 10;
            const endLoadValue = !isNaN(parseFloat(endLoadInputValue)) ? parseFloat(endLoadInputValue) : 10;
            
            // Obtener la longitud del miembro si existe
            const memberLengthMeters = loadDrawState.memberLengthMeters || 1.0;
            
            // Determinar si estamos en modo de carga externa
            const externalLoadButton = document.getElementById('externalLoad');
            const isExternalLoadActive = externalLoadButton && externalLoadButton.classList.contains('active');
            
            // Verificar que el miembro seleccionado exista (usando la variable que se declara más adelante)
            let selectedMemberForProjection = members.find(m => m.id === loadDrawState.selectedMemberId);
            if (!selectedMemberForProjection) {
                console.error('Error: No se encontró el miembro seleccionado');
                alert('Error: No se encontró el miembro seleccionado');
                return;
            }
            
            // Buscar los nodos de inicio y fin para calcular la proyección horizontal si es necesario
            let startNodeForProjection = nodes.find(n => n.id === selectedMemberForProjection.startNodeId);
            let endNodeForProjection = nodes.find(n => n.id === selectedMemberForProjection.endNodeId);
            
            // Calcular la proyección horizontal si es carga externa
            let maxDistance = memberLengthMeters;
            if (isExternalLoadActive && startNodeForProjection && endNodeForProjection) {
                const dx = Math.abs(endNodeForProjection.x - startNodeForProjection.x);
                maxDistance = dx; // Proyección horizontal en metros
                console.log('Usando proyección horizontal para guardar:', maxDistance, 'metros');
            }
            
            // Parsear valores de distancia en metros
            let startDistanceMeters = !isNaN(parseFloat(startDistanceInputValue)) ? parseFloat(startDistanceInputValue) : 0;
            let endDistanceMeters = !isNaN(parseFloat(endDistanceInputValue)) ? parseFloat(endDistanceInputValue) : maxDistance;
            
            // Limitar los valores al rango válido (0 a longitud máxima)
            startDistanceMeters = Math.max(0, Math.min(maxDistance, startDistanceMeters));
            endDistanceMeters = Math.max(0, Math.min(maxDistance, endDistanceMeters));
            
            // Convertir a proporciones normalizadas (0-1) para guardar en el objeto de carga
            const startDistanceValue = startDistanceMeters / memberLengthMeters;
            const endDistanceValue = endDistanceMeters / memberLengthMeters;
            
            console.log('Valores de carga procesados:', { 
                inputStartLoad: startLoadInputValue, 
                inputEndLoad: endLoadInputValue,
                parsedStartLoad: startLoadValue, 
                parsedEndLoad: endLoadValue,
                inputStartDistance: startDistanceInputValue,
                inputEndDistance: endDistanceInputValue,
                parsedStartDistance: startDistanceValue,
                parsedEndDistance: endDistanceValue
            });
            
            // Determinar el tipo de carga seleccionado
            let loadType = 'perpendicular';
            
            // Verificar qué botón de tipo de carga está activo
            const perpendicularBtn = document.getElementById('perpendicularLoad');
            const linearXBtn = document.getElementById('linearXLoad');
            const externalBtn = document.getElementById('externalLoad');
            const axialBtn = document.getElementById('axialLoad');
            
            if (perpendicularBtn && perpendicularBtn.classList.contains('active')) {
                loadType = 'perpendicular';
            } else if (linearXBtn && linearXBtn.classList.contains('active')) {
                loadType = 'linearX';
            } else if (externalBtn && externalBtn.classList.contains('active')) {
                loadType = 'external';
            } else if (axialBtn && axialBtn.classList.contains('active')) {
                loadType = 'axial';
            } else {
                // Si ningún botón conocido está activo, mostramos un mensaje
                console.warn('No se ha seleccionado un tipo de carga válido');
                alert('Por favor, seleccione un tipo de carga válido para continuar.');
                return;
            }
            
            console.log('Valores de carga:', { 
                startLoadValue, 
                endLoadValue, 
                startDistanceValue,
                endDistanceValue,
                loadType 
            });
            console.log('Miembro seleccionado:', loadDrawState.selectedMemberId);
            
            // Verificar que el miembro seleccionado exista
            const selectedMember = members.find(m => m.id === loadDrawState.selectedMemberId);
            if (!selectedMember) {
                console.error('Error: No se encontró el miembro seleccionado');
                alert('Error: No se encontró el miembro seleccionado');
                return;
            }
            
            // Buscar los nodos de inicio y fin del miembro
            const startNode = nodes.find(n => n.id === selectedMember.startNodeId);
            const endNode = nodes.find(n => n.id === selectedMember.endNodeId);
            
            if (!startNode || !endNode) {
                console.error('Error: No se encontraron los nodos del miembro');
                alert('Error: No se encontraron los nodos del miembro');
                return;
            }
            
            console.log('Nodos encontrados:', { startNode, endNode });
            
            // Asegurarse de que la variable global loads exista
            if (typeof window.loads === 'undefined') {
                console.log('Inicializando array global de cargas');
                window.loads = [];
            }
            
            // Crear el objeto de carga distribuida
            const distributedLoad = {
                id: 'dl_' + Date.now(),
                type: 'distributed',
                memberId: loadDrawState.selectedMemberId,
                startValue: startLoadValue,
                endValue: endLoadValue,
                startDistance: startDistanceValue,
                endDistance: endDistanceValue,
                loadType: loadType,
                member: selectedMember,
                startNode: startNode,
                endNode: endNode
            };
            
            // Añadir la carga al array global
            window.loads.push(distributedLoad);
            console.log('Carga distribuida añadida al array global. Total cargas:', window.loads.length);
            
            // Cerrar el modal
            closeDistributedLoadModal();
            
            // Restablecer el estado de dibujo de carga
            resetLoadDrawState();
            
            // Actualizar el canvas y dibujar la carga
            try {
                console.log('Actualizando canvas...');
                updateCanvas();
                
                console.log('Llamando directamente a drawSingleDistributedLoad...');
                drawSingleDistributedLoad(distributedLoad);
                
                // Forzar un redibujado adicional después de un breve retraso
                setTimeout(() => {
                    console.log('Redibujando canvas después de un breve retraso...');
                    updateCanvas();
                }, 100);
            } catch (e) {
                console.error('Error al dibujar la carga:', e);
                alert('Se guardó la carga, pero hubo un error al dibujarla. Intente actualizar la pantalla.');
            }
            
            console.log('Carga distribuida guardada con éxito');
        } catch (error) {
            console.error('Error en la función saveDistributedLoad:', error);
            alert('Ocurrió un error al guardar la carga distribuida. Verifique la consola para más detalles.');
        }
    }
    
    // Función auxiliar para dibujar una sola carga distribuida
    function drawSingleDistributedLoad(load) {
        if (!load || load.type !== 'distributed') {
            console.error('No se puede dibujar: la carga no es de tipo distribuida o es nula');
            return;
        }
        
        console.log('Dibujando carga distribuida individual:', load);
        
        // Verificar si esta carga está seleccionada
        const isSelected = (selectedLoadId === load.id);
        
        try {
            // Obtener los nodos de inicio y fin
            const startNode = load.startNode || nodes.find(n => n.id === load.member.startNodeId);
            const endNode = load.endNode || nodes.find(n => n.id === load.member.endNodeId);
            
            if (!startNode || !endNode) {
                console.error('No se encontraron los nodos para dibujar la carga distribuida');
                return;
            }
            
            // Determinar el tipo de carga (perpendicular o normal al eje X)
            const loadType = load.loadType || 'perpendicular';
            
            console.log('Nodos para dibujo:', { startNode, endNode });
            
            // Convertir coordenadas de la cuadrícula a coordenadas de canvas
            const startX = originX() + startNode.x * gridSize;
            const startY = originY() - startNode.y * gridSize;
            const endX = originX() + endNode.x * gridSize;
            const endY = originY() - endNode.y * gridSize;
            
            console.log('Coordenadas de dibujo:', { startX, startY, endX, endY });
            
            // Calcular la longitud y el ángulo del miembro
            const memberLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const angle = Math.atan2(endY - startY, endX - startX);
            
            console.log('Longitud y ángulo:', { memberLength, angle: angle * (180 / Math.PI) + ' grados' });
            
            // Establecer el color para la carga distribuida (resaltado si está seleccionada)
            if (isSelected) {
                ctx.strokeStyle = '#FFFF00'; // Amarillo brillante para carga seleccionada
                ctx.fillStyle = '#FFFF00';
                ctx.lineWidth = 3; // Línea más gruesa para carga seleccionada
            } else {
                ctx.strokeStyle = '#FF9900'; // Naranja para carga normal
                ctx.fillStyle = '#FF9900';
                ctx.lineWidth = 2;
            }
            
            // Guardar el estado actual del contexto
            ctx.save();
            
            // Trasladar y rotar el contexto para facilitar el dibujo
            ctx.translate(startX, startY);
            ctx.rotate(angle);
            
            // Dibujar la línea de la barra con un grosor mayor para mejor visibilidad
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(memberLength, 0);
            ctx.stroke();
            ctx.lineWidth = 2; // Restaurar el grosor original para el resto de los elementos
            
            // Obtener los valores absolutos para el cálculo de proporciones
            const absStartValue = Math.abs(load.startValue);
            const absEndValue = Math.abs(load.endValue);
            const maxAbsValue = Math.max(absStartValue, absEndValue, 0.1); // Valor mínimo pequeño para evitar división por cero
            
            // Determinar dirección basada en el signo
            // Para valores positivos: flechas hacia abajo (0,-1)
            // Para valores negativos: flechas hacia arriba (0,1)
            // Para valor cero: usar dirección por defecto (hacia abajo)
            const startDirection = load.startValue === 0 ? 1 : Math.sign(load.startValue);
            const endDirection = load.endValue === 0 ? 1 : Math.sign(load.endValue);
            
            // Constantes para el dibujo
            const numArrows = 10;
            const baseArrowLength = 40; // Longitud base para escalar (aumentada para mejor visibilidad)
            
            // Determinar los valores de distancia
            const startDistance = load.startDistance !== undefined ? load.startDistance : 0;
            const endDistance = load.endDistance !== undefined ? load.endDistance : 1;
            
            // Validar que las distancias estén dentro del rango válido
            const validStartDistance = Math.max(0, Math.min(1, startDistance));
            const validEndDistance = Math.max(0, Math.min(1, endDistance));
            
            console.log('Datos de carga para dibujo:', {
                startValue: load.startValue,
                endValue: load.endValue,
                startDirection,
                endDirection,
                maxAbsValue,
                startDistance: validStartDistance,
                endDistance: validEndDistance
            });
            
            // Dibujar línea superior que sigue la forma de la carga distribuida
            // Solo para cargas perpendiculares - para linearX lo hacemos más adelante
            if (loadType === 'perpendicular') {
                // Calcular posiciones reales basadas en las distancias especificadas
                const startX = validStartDistance * memberLength;
                const endX = validEndDistance * memberLength;
                
                // Eliminamos la línea superior que sigue la forma de la carga distribuida
                // ya que el usuario ha solicitado que no se dibuje esta línea horizontal
                
                // Dibujar líneas verticales en los puntos de inicio y fin para conectar con la barra
                // Línea en el punto de inicio
                const startY = -startDirection * (absStartValue / maxAbsValue) * baseArrowLength;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX, 0);
                ctx.stroke();
                
                // Línea en el punto final
                const endY = -endDirection * (absEndValue / maxAbsValue) * baseArrowLength;
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX, 0);
                ctx.stroke();
                
                // Dibujar pequeños círculos en los puntos de inicio y fin para resaltarlos
                ctx.fillStyle = ctx.strokeStyle; // Usar el mismo color que las líneas
                
                // Punto de inicio
                ctx.beginPath();
                ctx.arc(startX, 0, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Punto final
                ctx.beginPath();
                ctx.arc(endX, 0, 3, 0, 2 * Math.PI);
                ctx.fill();
            } else if (loadType === 'axial') {
                // CARGA AXIAL: Las flechas se dibujan a lo largo del eje de la barra
                
                // Calcular posiciones reales basadas en las distancias especificadas
                const startX = validStartDistance * memberLength;
                const endX = validEndDistance * memberLength;
                
                // Dibujar pequeños círculos en los puntos de inicio y fin para resaltarlos
                ctx.fillStyle = ctx.strokeStyle; // Usar el mismo color que las líneas
                
                // Punto de inicio
                ctx.beginPath();
                ctx.arc(startX, 0, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Punto final
                ctx.beginPath();
                ctx.arc(endX, 0, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Crear un array para rastrear las flechas axiales
                const axialArrows = [];
                
                // Calcular cuántas flechas caben en el rango especificado
                const rangeLength = validEndDistance - validStartDistance;
                const arrowsInRange = Math.max(2, Math.round(numArrows * rangeLength));
                
                // Calcular flechas uniformemente distribuidas sobre el eje de la barra
                for (let i = 0; i <= arrowsInRange; i++) {
                    // Calcular la posición X real en la barra basada en las distancias especificadas
                    const rangeRatio = i / arrowsInRange;
                    const distanceAlongMember = validStartDistance + rangeRatio * rangeLength;
                    const xLocal = distanceAlongMember * memberLength;
                    
                    // Calcular el valor de la carga en este punto (interpolación)
                    const value = load.startValue + rangeRatio * (load.endValue - load.startValue);
                    
                    // Determinar la dirección y el tamaño de la flecha
                    const absValue = Math.abs(value);
                    const direction = value === 0 ? 1 : Math.sign(value); // 1 es positivo (hacia la derecha), -1 es negativo (hacia la izquierda)
                    
                    // Para valores de carga cero, usar un tamaño mínimo de flecha
                    const thisArrowLength = absValue === 0 ? 5 : (absValue / maxAbsValue) * baseArrowLength;
                    
                    // Guardar el contexto para la flecha individual
                    ctx.save();
                    
                    // Trasladar el contexto a la posición en la barra donde estamos dibujando la flecha
                    ctx.translate(xLocal, 0);
                    
                    // Dibujar la flecha (horizontal a lo largo del eje de la barra)
                    ctx.beginPath();
                    ctx.moveTo(0, 0); // Punto de inicio (la traslación ya nos puso en la posición correcta)
                    const arrowXEnd = thisArrowLength * direction;
                    ctx.lineTo(arrowXEnd, 0); // Línea horizontal a lo largo de la barra
                    ctx.stroke();
                    
                    // Dibujar la punta de la flecha
                    if (direction > 0) { // Dirección hacia la derecha (hacia el final de la barra)
                        ctx.beginPath();
                        ctx.moveTo(arrowXEnd, 0);
                        ctx.lineTo(arrowXEnd - 5, -5); // Parte superior de la punta
                        ctx.lineTo(arrowXEnd - 5, 5);  // Parte inferior de la punta
                        ctx.closePath();
                        ctx.fill();
                    } else { // Dirección hacia la izquierda (hacia el inicio de la barra)
                        ctx.beginPath();
                        ctx.moveTo(arrowXEnd, 0);
                        ctx.lineTo(arrowXEnd + 5, -5); // Parte superior de la punta
                        ctx.lineTo(arrowXEnd + 5, 5);  // Parte inferior de la punta
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    // Restaurar el contexto para la siguiente flecha
                    ctx.restore();
                }
            } else if (loadType === 'external') {
                // CARGA EXTERNA: Siempre vertical hacia abajo, pero actuando sobre la proyección en el eje X
                
                // Calcular posiciones reales basadas en las distancias especificadas
                const startX = validStartDistance * memberLength;
                const endX = validEndDistance * memberLength;
                
                // Dibujar pequeños círculos en los puntos de inicio y fin para resaltarlos
                ctx.fillStyle = ctx.strokeStyle; // Usar el mismo color que las líneas
                
                // Punto de inicio
                ctx.beginPath();
                ctx.arc(startX, 0, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Punto final
                ctx.beginPath();
                ctx.arc(endX, 0, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Guardar el contexto actual (que está rotado para alinearse con el miembro)
                ctx.save();
                
                // Deshacer la rotación para que las flechas sean siempre verticales hacia abajo
                ctx.rotate(-angle);
                
                // Crear un array para rastrear las flechas en proyección X
                const externalArrows = [];
                
                // Calcular cuántas flechas caben en el rango especificado
                const rangeLength = validEndDistance - validStartDistance;
                const arrowsInRange = Math.max(2, Math.round(numArrows * rangeLength));
                
                // Obtener los nodos de inicio y fin del miembro para calcular la proyección
                const memberStartX = 0;  // En el sistema local de coordenadas ya está en (0,0)
                const memberStartY = 0;
                const memberEndX = memberLength; // Longitud total de la barra en X local
                const memberEndY = 0; // En Y local siempre es 0 porque el sistema se ha rotado
                
                // Calcular el punto donde empieza y termina la proyección en X de la barra
                const projStartX = memberStartX + validStartDistance * (memberEndX - memberStartX);
                const projEndX = memberStartX + validEndDistance * (memberEndX - memberStartX);
                
                // Calcular flechas uniformemente distribuidas sobre la proyección de la barra
                for (let i = 0; i <= arrowsInRange; i++) {
                    // Calcular la posición X real en la barra basada en las distancias especificadas
                    const rangeRatio = i / arrowsInRange;
                    const distanceAlongMember = validStartDistance + rangeRatio * rangeLength;
                    const xLocal = distanceAlongMember * memberLength;
                    
                    // Calcular el valor de la carga en este punto (interpolación)
                    const value = load.startValue + rangeRatio * (load.endValue - load.startValue);
                    
                    // Determinar la dirección y el tamaño de la flecha
                    const absValue = Math.abs(value);
                    const direction = value === 0 ? 1 : Math.sign(value); // Para valor cero, usar dirección hacia abajo (1)
                    
                    // Para valores de carga cero, usar un tamaño mínimo de flecha
                    const thisArrowLength = absValue === 0 ? 5 : (absValue / maxAbsValue) * baseArrowLength;
                    
                    // Desrotar el sistema de coordenadas para mantener las flechas verticales
                    ctx.save();
                    
                    // Trasladar el contexto a la posición en la barra donde estamos dibujando la flecha
                    ctx.translate(xLocal, 0);
                    
                    // Deshacer la rotación para que las flechas sean verticales en el canvas
                    ctx.rotate(0);
                    
                    // Dibujar la flecha (siempre vertical en coordenadas globales)
                    ctx.beginPath();
                    ctx.moveTo(0, 0); // Punto de inicio (la traslación ya nos puso en la posición correcta)
                    const arrowYEnd = thisArrowLength * direction;
                    ctx.lineTo(0, arrowYEnd ); // Línea vertical
                    ctx.stroke();
                    
                    // Dibujar la punta de la flecha
                    if (direction > 0) { // Dirección hacia abajo
                        ctx.beginPath();
                        ctx.moveTo(0, arrowYEnd);
                        ctx.lineTo(-5, arrowYEnd - 5);
                        ctx.lineTo(5, arrowYEnd - 5);
                        ctx.closePath();
                        ctx.fill();
                    } else { // Dirección hacia arriba
                        ctx.beginPath();
                        ctx.moveTo(0, arrowYEnd);
                        ctx.lineTo(-5, arrowYEnd + 5);
                        ctx.lineTo(+5, arrowYEnd + 5);
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    // Restaurar el contexto para la siguiente flecha
                    ctx.restore();
                }
                
                // Restaurar el contexto para volver al sistema de coordenadas del miembro
                ctx.restore();
            }
            
            // Crear un array para almacenar las posiciones y datos de las flechas
            // Este array será usado tanto para dibujo como para etiquetas
            window.loadArrowPositions = [];
            
            // Dibujar las flechas solo dentro del rango de distancia especificado
            // Calcular cuántas flechas caben en el rango especificado
            const rangeLength = validEndDistance - validStartDistance;
            const arrowsInRange = Math.max(2, Math.round(numArrows * rangeLength));
            
            for (let i = 0; i <= arrowsInRange; i++) {
                // Calcular la posición X real en la barra basada en las distancias especificadas
                const rangeRatio = i / arrowsInRange;
                const distanceAlongMember = validStartDistance + rangeRatio * (validEndDistance - validStartDistance);
                const x = distanceAlongMember * memberLength;
                
                // Calcular el valor de la carga en este punto (interpolación)
                const value = load.startValue + rangeRatio * (load.endValue - load.startValue);
                
                // Determinar la dirección y el tamaño de la flecha
                const absValue = Math.abs(value);
                const direction = value === 0 ? 1 : Math.sign(value); // Para valor cero, usar dirección hacia abajo (1)
                
                // Para valores de carga cero, usar un tamaño mínimo de flecha
                let thisArrowLength;
                if (absValue === 0) {
                    thisArrowLength = 5; // Tamaño mínimo para flechas con valor cero
                } else {
                    thisArrowLength = (absValue / maxAbsValue) * baseArrowLength;
                }
                
                // Guardar datos de esta flecha para usar en etiquetas y otros cálculos
                window.loadArrowPositions.push({
                    x: x,
                    value: value,
                    absValue: absValue,
                    direction: direction,
                    length: thisArrowLength,
                    distanceRatio: distanceAlongMember // Guardar la proporción de distancia a lo largo de la barra
                });
                
                if (loadType === 'perpendicular') {
                    // CARGAS PERPENDICULARES A LA ESTRUCTURA
                    // Determinar la posición Y de la flecha (perpendicular a la barra)
                    const arrowY = -direction * thisArrowLength;
                    
                    if (direction > 0) {
                        // CASO POSITIVO: Flecha va desde arrowY hacia la barra (0)
                        ctx.beginPath();
                        ctx.moveTo(x, arrowY); // Punto de inicio (lejos de la barra)
                        ctx.lineTo(x, 0);      // Punto final (EN la barra)
                        ctx.stroke();
                        
                        // Dibujar la punta de la flecha EXACTAMENTE en la barra
                        ctx.beginPath();
                        ctx.moveTo(x, 0);      // Centro de la punta EN la barra
                        ctx.lineTo(x - 5, -5); // Lado izquierdo de la punta
                        ctx.lineTo(x + 5, -5); // Lado derecho de la punta
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        // CASO NEGATIVO: Flecha va desde arrowY hacia la barra (0)
                        ctx.beginPath();
                        ctx.moveTo(x, arrowY); // Punto de inicio (lejos de la barra)
                        ctx.lineTo(x, 0);      // Punto final (EN la barra)
                        ctx.stroke();
                        
                        // Punto en la intersección con la barra para mejor visibilidad
                        ctx.beginPath();
                        ctx.arc(x, 0, 2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Punta de la flecha orientada hacia la barra
                        ctx.beginPath();
                        ctx.moveTo(x, 0);      // Centro de la punta EN la barra
                        ctx.lineTo(x - 5, 5);  // Lado izquierdo de la punta (hacia abajo)
                        ctx.lineTo(x + 5, 5);  // Lado derecho de la punta (hacia abajo)
                        ctx.closePath();
                        ctx.fill();
                    }
                } else if (loadType === 'linearX') {
                    // CARGAS LINEALES NORMALES AL EJE X
                    // Para cargas normales al eje X, las flechas siempre van verticales
                    
                    // Guardar el contexto actual para restaurarlo después
                    ctx.save();
                    
                    // Deshacer la rotación para que las flechas sean siempre verticales
                    ctx.rotate(-angle);
                    
                    // Convertir la posición X de la barra rotada a coordenadas sin rotar
                    // Usando trigonometría para calcular la posición real en el canvas
                    const unrotatedX = x * Math.cos(-angle);
                    const unrotatedY = -x * Math.sin(-angle);
                    
                    // Longitud de la flecha (siempre vertical)
                    const verticalArrowLength = thisArrowLength;
                    
                    // Ya no necesitamos variables para líneas horizontales,
                    // pero mantenemos la lógica para calcular valores de la carga
                    if (i === 0) {
                        // No hacemos ninguna inicialización relacionada con líneas horizontales
                    }
                    
                    // Calcular los valores para este punto particular de la carga
                    const interpolatedValue = load.startValue + (i / numArrows) * (load.endValue - load.startValue);
                    const direction = interpolatedValue >= 0 ? 1 : -1;
                    const absValue = Math.abs(interpolatedValue);
                    
                    // Calcular longitud proporcional para esta flecha
                    let arrowLength;
                    if (absValue === 0) {
                        arrowLength = 5; // Tamaño mínimo para valores cero
                    } else {
                        arrowLength = (absValue / maxAbsValue) * baseArrowLength;
                    }
                    
                    // Determinar la posición de inicio de la flecha (extremo exterior)
                    const startY = direction > 0 ? 
                        unrotatedY - arrowLength : // Positiva: arriba de la barra
                        unrotatedY + arrowLength;  // Negativa: abajo de la barra
                    
                    // Eliminamos el código para dibujar la línea superior en modo linearX
                    // ya que el usuario ha solicitado que no se dibuje esta línea horizontal
                    
                    // Ahora dibujamos la flecha individual
                    if (direction > 0) {
                        // CASO POSITIVO: Flecha hacia abajo (en coordenadas globales)
                        ctx.beginPath();
                        ctx.moveTo(unrotatedX, unrotatedY - arrowLength); // Punto de inicio (lejos de la barra)
                        ctx.lineTo(unrotatedX, unrotatedY); // Punto final EN la barra
                        ctx.stroke();
                        
                        // Dibujar la punta de la flecha EXACTAMENTE en la barra
                        ctx.beginPath();
                        ctx.moveTo(unrotatedX, unrotatedY); // Centro de la punta EN la barra
                        ctx.lineTo(unrotatedX - 5, unrotatedY - 5); // Lado izquierdo de la punta
                        ctx.lineTo(unrotatedX + 5, unrotatedY - 5); // Lado derecho de la punta
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        // CASO NEGATIVO: Flecha hacia arriba (en coordenadas globales)
                        ctx.beginPath();
                        ctx.moveTo(unrotatedX, unrotatedY + arrowLength); // Punto de inicio (lejos de la barra)
                        ctx.lineTo(unrotatedX, unrotatedY); // Punto final EN la barra
                        ctx.stroke();
                        
                        // Dibujar la punta de la flecha EXACTAMENTE en la barra
                        ctx.beginPath();
                        ctx.moveTo(unrotatedX, unrotatedY); // Centro de la punta EN la barra
                        ctx.lineTo(unrotatedX - 5, unrotatedY + 5); // Lado izquierdo de la punta
                        ctx.lineTo(unrotatedX + 5, unrotatedY + 5); // Lado derecho de la punta
                        ctx.closePath();
                        ctx.fill();
                    }
                    
                    // Restaurar el contexto para continuar con el dibujo normal
                    ctx.restore();
                }
            }
            
            // Restaurar el contexto a su estado anterior
            ctx.restore();
            
            // Configurar estilo para las etiquetas (diferente al color de las cargas)
            // Usar un color distinto y más claro para las etiquetas
            if (isSelected) {
                ctx.fillStyle = '#FFFFFF'; // Blanco para etiquetas de carga seleccionada
            } else {
                ctx.fillStyle = '#b2b2b2'; 
            }
            // Configurar el borde negro
            ctx.strokeStyle = '#dc7d68'; // Color negro para el borde
            ctx.lineWidth = 0.5; // Grosor del borde
            ctx.font = 'bold 22px Gabriola';
            
            // Calcular los valores absolutos
            const startValueAbs = Math.abs(parseFloat(load.startValue));
            const endValueAbs = Math.abs(parseFloat(load.endValue));
            
            // Array para almacenar las posiciones de las etiquetas (para detección de clics)
            const labelPositions = [];
            
            // Verificar si la carga es constante (valores de inicio y fin son iguales o muy cercanos)
            const isConstantLoad = Math.abs(startValueAbs - endValueAbs) < 0.001;
            
            // Calcular el punto medio de las flechas para posicionar las etiquetas
            const labelArrows = 10; // Número aproximado de flechas que se usan para calcular posiciones de etiquetas
            const arrowLabelPositions = [];
            
            // Usar las distancias especificadas para calcular los puntos para las etiquetas
            const startDist = load.startDistance !== undefined ? Math.max(0, Math.min(1, load.startDistance)) : 0;
            const endDist = load.endDistance !== undefined ? Math.max(0, Math.min(1, load.endDistance)) : 1;
            
            // Calcular la posición de varias flechas a lo largo de la barra para determinar la mejor ubicación
            // pero solo dentro del rango de distancia especificado
            for (let i = 0; i <= labelArrows; i++) {
                const rangeRatio = i / labelArrows;
                const distanceAlongMember = startDist + rangeRatio * (endDist - startDist);
                const ratio = distanceAlongMember; // Proporción real a lo largo de toda la barra
                const x = startX + (endX - startX) * ratio;
                const y = startY + (endY - startY) * ratio;
                
                // Determinar el valor en este punto mediante interpolación lineal basado en la posición real en el rango de distancia
                const value = parseFloat(load.startValue) + (parseFloat(load.endValue) - parseFloat(load.startValue)) * rangeRatio;
                const valueAbs = Math.abs(value);
                const direction = value >= 0 ? 1 : -1; // 1 hacia abajo, -1 hacia arriba
                
                // Calcular la altura de la flecha en este punto (usando la misma lógica que para el dibujo de flechas)
                let arrowLength;
                if (valueAbs === 0) {
                    arrowLength = 5; // Tamaño mínimo para flechas con valor cero
                } else {
                    arrowLength = (valueAbs / Math.max(Math.abs(load.startValue), Math.abs(load.endValue), 0.1)) * 40;
                }
                
                // Guardar la ubicación potencial para una etiqueta
                arrowLabelPositions.push({
                    x: x,
                    y: y,
                    value: valueAbs,
                    direction: direction,
                    length: arrowLength,
                    // Ubicación propuesta para la etiqueta: en el punto medio de la flecha
                    labelX: x,
                    labelY: y + (direction * arrowLength / 2) // Punto medio de la flecha
                });
            }
            
            if (isConstantLoad) {
                // Para cargas constantes, colocamos la etiqueta en el centro
                // Usar un punto medio para ubicar la etiqueta
                const midIndex = Math.floor(arrowLabelPositions.length / 2);
                const midLocation = arrowLabelPositions[midIndex];
                
                // Ajustar la posición Y para que la etiqueta esté ENCIMA de la flecha
                // La etiqueta debe estar sobre la flecha, no dentro de ella
                const labelX = midLocation.x;
                const labelY = midLocation.y - (midLocation.direction * midLocation.length) + (midLocation.direction * 10); // Offset de 10px desde el extremo de la flecha
                
                // Medir el tamaño del texto para centrarlo
                const text = `${startValueAbs} kN/m`;
                const textWidth = ctx.measureText(text).width;
                
                // Dibujar la etiqueta centrada en X y posicionada en la mitad de la flecha
                ctx.fillText(text, labelX - textWidth / 2, labelY);
                
                // Guardar la posición de la etiqueta para detección de clics
                labelPositions.push({ x: labelX, y: labelY });
            } else {
                // Para cargas variables, mostramos etiquetas cerca del inicio y fin
                // Tomar puntos a 1/4 y 3/4 del camino para evitar solapamientos con otras cargas
                const quarterIndex = Math.floor(arrowLabelPositions.length * 0.2);
                const threeQuarterIndex = Math.floor(arrowLabelPositions.length * 0.8);
                
                const startLocation = arrowLabelPositions[quarterIndex];
                const endLocation = arrowLabelPositions[threeQuarterIndex];
                
                // Posicionar las etiquetas ENCIMA de las flechas, no dentro de ellas
                const startLabelX = startLocation.x-15;
                const startLabelY = startLocation.y - 35; //- (startLocation.direction * startLocation.length) - (startLocation.direction * 10);
                
                const endLabelX = endLocation.x+15;
                const endLabelY = endLocation.y - 35; //- (endLocation.direction * endLocation.length) - (endLocation.direction * 10);
                
                // Medir los tamaños de texto para centrarlos
                const startText = `${startValueAbs} kN/m`;
                const endText = `${endValueAbs} kN/m`;
                const startTextWidth = ctx.measureText(startText).width;
                const endTextWidth = ctx.measureText(endText).width;
                
                // Dibujar las etiquetas centradas en X y posicionadas en la parte superior de las flechas
                ctx.fillText(startText, startLabelX - startTextWidth / 2, startLabelY);
                ctx.fillText(endText, endLabelX - endTextWidth / 2, endLabelY);
                
                // Guardar las posiciones de las etiquetas para detección de clics
                labelPositions.push({ x: startLabelX, y: startLabelY });
                labelPositions.push({ x: endLabelX, y: endLabelY });
            }
            
            // Guardar los datos para detección de clics, incluyendo posiciones de etiquetas
            load._renderData = {
                startX, startY, endX, endY,
                angle, memberLength,
                labelPositions // Añadir las posiciones de las etiquetas
            };
            
            console.log('Carga distribuida dibujada exitosamente');
        } catch (error) {
            console.error('Error al dibujar la carga distribuida:', error);
        }
    }
    
    // Función para actualizar el marcador de ángulo en el modal de nodo
    function updateNodeAngleMarker(angle) {
        // Asegurar que el ángulo esté entre 0 y 360
        angle = ((angle % 360) + 360) % 360;
        
        // Calcular las coordenadas del marcador (relativas al centro)
        const radius = 50; // Radio del círculo en px (aproximado)
        const angleInRadians = angle * (Math.PI / 180);
        // Coordenadas para posicionar el marcador naranja
        // Recuerda que en HTML/CSS, Y positivo va hacia abajo
        const x = radius * Math.cos(angleInRadians);
        const y = -radius * Math.sin(angleInRadians); // Negativo para invertir el eje Y
        
        // Actualizar la posición del marcador naranja (bolita)
        const nodeMarker = document.getElementById('nodeAngleMarker');
        if (nodeMarker) {
            // El centro del círculo está en 50%, 50%
            nodeMarker.style.left = `${50 + x}%`;
            nodeMarker.style.top = `${50 + y}%`;
        }
        
        // Actualizar también el valor del input
        const nodeAngleInput = document.getElementById('nodeLoadAngle');
        if (nodeAngleInput) {
            nodeAngleInput.value = angle;
        }
        
        // Posicionar y rotar la flecha para que la punta esté en el centro y la cola coincida con la bolita naranja
        const nodeArrow = document.getElementById('nodeAngleArrow');
        if (nodeArrow) {
            // La flecha siempre se posiciona en el centro del círculo
            nodeArrow.style.top = `50%`;
            nodeArrow.style.left = `50%`;
            
            // Rotar la flecha para que vaya desde el centro hacia la bolita naranja
            // La punta está en el centro y la cola se extiende hacia la posición de la bolita
            nodeArrow.style.transform = `rotate(${-angle}deg)`; // Rotación correcta para que la cola apunte a la bolita
        }
    }
    
    // Función para actualizar la posición del marcador de ángulo
    function updateAngleMarker(angle) {
        // Asegurar que el ángulo esté entre 0 y 360
        angle = ((angle % 360) + 360) % 360;
        
        // Calcular las coordenadas del marcador (relativas al centro)
        const radius = 50; // Radio del círculo en px (aproximado)
        const angleInRadians = angle * (Math.PI / 180);
        // Coordenadas para posicionar el marcador naranja
        // Recuerda que en HTML/CSS, Y positivo va hacia abajo
        const x = radius * Math.cos(angleInRadians);
        const y = -radius * Math.sin(angleInRadians); // Negativo para invertir el eje Y
        
        // Actualizar la posición del marcador naranja (bolita)
        const angleMarker = document.getElementById('angleMarker');
        if (angleMarker) {
            // El centro del círculo está en 50%, 50%
            angleMarker.style.left = `${50 + x}%`;
            angleMarker.style.top = `${50 + y}%`;
        }
        
        // NO actualizamos la etiqueta del cuadrante (90°) ya que debe permanecer estática
        // Solo actualizamos el input del ángulo
        
        // Actualizar también el valor del input
        const angleInput = document.getElementById('loadAngle');
        if (angleInput) {
            angleInput.value = angle;
        }
        
        // Posicionar y rotar la flecha para que la punta esté en el centro y la cola coincida con la bolita naranja
        const arrow = document.querySelector('.angle-arrow');
        if (arrow) {
            // La flecha siempre se posiciona en el centro del círculo
            arrow.style.top = `50%`;
            arrow.style.left = `50%`;
            
            // Rotar la flecha para que vaya desde el centro hacia la bolita naranja
            // La punta está en el centro y la cola se extiende hacia la posición de la bolita
            arrow.style.transform = `rotate(${-angle}deg)`; // Rotación correcta para que la cola apunte a la bolita
        }
    }
    
    function resetLoadDrawState() {
        loadDrawState.active = false;
        loadDrawState.type = null;
        loadDrawState.selectingStage = 0;
        
        // Deactivate button
        addLoadButton.classList.remove('active');
        
        // Reset cursor
        if (!isAddingNodeMode && !memberDrawState.active) {
            canvas.style.cursor = 'grab';
        }
    }
    
    function startLoadDrawing(type) {
        loadDrawState.active = true;
        loadDrawState.type = type;
        loadDrawState.selectingStage = 1;
        
        // Activate button
        addLoadButton.classList.add('active');
        
        // Set cursor
        canvas.style.cursor = 'crosshair';
        
        // Close modal
        closeLoadTypeModal();
        
        // Mensaje informativo según el tipo de carga
        switch (type) {
            case 'pointMember':
                console.log('Seleccione un miembro para aplicar la carga puntual');
                break;
            case 'pointNode':
                console.log('Seleccione un nodo para aplicar la carga puntual');
                break;
            case 'distributed':
                console.log('Seleccione un miembro para aplicar la carga distribuida');
                break;
            case 'moment':
                console.log('Seleccione un nodo para aplicar el momento');
                break;
        }
    }
    
    // Initial population of the section properties list
    populateSectionPropertyList();

    // Event Listeners para el botón de añadir carga y el modal de tipo de carga
    if (addLoadButton) {
        addLoadButton.addEventListener('click', () => {
            // Desactivar otros modos activos
            if (isAddingNodeMode) {
                isAddingNodeMode = false;
                addNodeButton.classList.remove('active');
            }
            
            if (memberDrawState.active) {
                resetMemberDrawState();
            }
            
            // Abrir el modal de tipo de carga
            openLoadTypeModal();
        });
    }
    
    // Event listeners para los botones del modal de tipo de carga
    if (pointLoadMemberButton) {
        pointLoadMemberButton.addEventListener('click', () => {
            closeLoadTypeModal(); // Cerrar el modal de tipo de carga
            
            // Activar el modo de selección de barra para carga puntual
            loadDrawState.active = true;
            loadDrawState.type = 'pointMember';
            loadDrawState.selectingStage = 1; // Etapa de selección de barra
            loadDrawState.selectedMemberId = null; // Resetear cualquier selección previa
            
            // Activar el botón de carga
            addLoadButton.classList.add('active');
            
            // Cambiar el cursor para indicar modo de selección
            canvas.style.cursor = 'crosshair';
            
            // Mensaje para el usuario
            console.log('Seleccione una barra para aplicar la carga puntual');
            alert('Seleccione una barra para aplicar la carga puntual');
        });
    }
    
    if (pointLoadNodeButton) {
        pointLoadNodeButton.addEventListener('click', () => {
            startLoadDrawing('pointNode');
        });
    }
    
    if (distributedLoadButton) {
        distributedLoadButton.addEventListener('click', () => {
            startLoadDrawing('distributed');
        });
    }
    
    if (momentLoadButton) {
        momentLoadButton.addEventListener('click', () => {
            startLoadDrawing('moment');
        });
    }
    
    // Event listeners para cerrar el modal de tipo de carga
    if (closeButtonLoadType) {
        closeButtonLoadType.addEventListener('click', closeLoadTypeModal);
    }
    
    if (cancelLoadTypeButton) {
        cancelLoadTypeButton.addEventListener('click', closeLoadTypeModal);
    }
    
    // Event listener para cerrar el modal haciendo clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === loadTypeModal) {
            closeLoadTypeModal();
        }
        if (event.target === pointLoadMemberModal) {
            closePointLoadMemberModal();
        }
        if (event.target === pointLoadNodeModal) {
            closePointLoadNodeModal();
        }
        if (event.target === editDistLoadModal) {
            closeEditDistLoadModal();
        }
        if (event.target === distributedLoadModal) {
            closeDistributedLoadModal();
        }
    });
    
    // Event listener para cerrar los modales con la tecla Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            // Cerrar modal de tipo de carga si está abierto
            if (loadTypeModal && loadTypeModal.style.display === 'block') {
                closeLoadTypeModal();
            }
            // Cerrar modal de carga puntual sobre la barra si está abierto
            if (pointLoadMemberModal && pointLoadMemberModal.style.display === 'block') {
                closePointLoadMemberModal();
            }
            // Cerrar modal de carga puntual sobre el nodo si está abierto
            if (pointLoadNodeModal && pointLoadNodeModal.style.display === 'block') {
                closePointLoadNodeModal();
            }
            // Cerrar modal de edición de carga distribuida si está abierto
            if (editDistLoadModal && editDistLoadModal.style.display === 'block') {
                closeEditDistLoadModal();
            }
            // Cerrar modal de carga distribuida si está abierto
            if (distributedLoadModal && distributedLoadModal.style.display === 'block') {
                closeDistributedLoadModal();
            }
        }
    });
    
    // Event listeners para el modal de carga puntual sobre la barra
    if (closeButtonPointLoadMember) {
        closeButtonPointLoadMember.addEventListener('click', closePointLoadMemberModal);
    }
    
    if (cancelPointLoadMemberButton) {
        cancelPointLoadMemberButton.addEventListener('click', closePointLoadMemberModal);
    }
    
    // Event listeners para el modal de carga distribuida
    const closeDistributedLoadButton = document.getElementById('closeDistributedLoad');
    const cancelDistributedLoadButton = document.getElementById('cancelDistributedLoad');
    const saveDistributedLoadButton = document.getElementById('saveDistributedLoad');
    
    if (closeDistributedLoadButton) {
        closeDistributedLoadButton.addEventListener('click', closeDistributedLoadModal);
    }
    
    if (cancelDistributedLoadButton) {
        cancelDistributedLoadButton.addEventListener('click', closeDistributedLoadModal);
    }
    
    if (saveDistributedLoadButton) {
        saveDistributedLoadButton.addEventListener('click', saveDistributedLoad);
    }
    
    // Event listeners para el modal de edición de cargas distribuidas
    if (closeEditDistLoadButton) {
        closeEditDistLoadButton.addEventListener('click', closeEditDistLoadModal);
        console.log('Event listener agregado al botón de cierre del modal de edición');
    } else {
        console.error('No se encontró el botón de cierre del modal de edición');
    }
    
    if (cancelEditDistLoadButton) {
        cancelEditDistLoadButton.addEventListener('click', closeEditDistLoadModal);
        console.log('Event listener agregado al botón de cancelar del modal de edición');
    } else {
        console.error('No se encontró el botón de cancelar del modal de edición');
    }
    
    if (saveEditDistLoadButton) {
        saveEditDistLoadButton.addEventListener('click', saveEditDistLoad);
        console.log('Event listener agregado al botón de guardar del modal de edición');
    } else {
        console.error('No se encontró el botón de guardar del modal de edición');
    }
    
    // Event listeners para los botones de tipo de carga en el modal de carga distribuida
    const loadTypeButtons = document.querySelectorAll('.load-type-button');
    loadTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Quitar la clase 'active' de todos los botones
            loadTypeButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir la clase 'active' al botón seleccionado
            this.classList.add('active');
            console.log('Tipo de carga seleccionado:', this.id);
        });
    });
    
    // Función para abrir el modal de edición de carga distribuida
    function openEditDistLoadModal(load) {
        if (!load || load.type !== 'distributed') {
            console.error('No se puede editar: la carga no es de tipo distribuida o es nula');
            return;
        }
        
        console.log('Abriendo modal de edición para carga:', load);
        
        // Guardar la carga que está siendo editada en variable global
        window.currentEditingLoad = load;
        
        // Usar variables globales para acceder a los elementos DOM - Valores de carga
        if (window.editStartLoadInput) {
            window.editStartLoadInput.value = load.startValue;
            console.log('Valor inicial de carga establecido:', window.editStartLoadInput.value);
        } else {
            console.error('No se encontró el campo de entrada para el valor inicial de carga');
        }
        
        if (window.editEndLoadInput) {
            window.editEndLoadInput.value = load.endValue;
            console.log('Valor final de carga establecido:', window.editEndLoadInput.value);
        } else {
            console.error('No se encontró el campo de entrada para el valor final de carga');
        }
        
        // Calcular la longitud real del miembro
        const selectedMember = members.find(m => m.id === load.memberId);
        let memberLengthMeters = 1.0; // Valor por defecto
        
        if (selectedMember) {
            const startNode = nodes.find(n => n.id === selectedMember.startNodeId);
            const endNode = nodes.find(n => n.id === selectedMember.endNodeId);
            
            if (startNode && endNode) {
                // Calcular la distancia entre los nodos en metros
                const dx = endNode.x - startNode.x;
                const dy = endNode.y - startNode.y;
                memberLengthMeters = Math.sqrt(dx*dx + dy*dy);
                
                // Guardar la longitud para su uso posterior
                window.currentEditingMemberLength = memberLengthMeters;
                console.log('Longitud del miembro para edición:', memberLengthMeters, 'metros');
            }
        }
        
        // Cargar valores de distancia convertidos a metros reales
        if (window.editStartDistanceInput) {
            // Convertir de proporción normalizada (0-1) a metros reales
            const startDistanceMeters = (load.startDistance !== undefined ? load.startDistance : 0) * memberLengthMeters;
            window.editStartDistanceInput.value = startDistanceMeters.toFixed(2);
            window.editStartDistanceInput.setAttribute('max', memberLengthMeters.toFixed(2));
            window.editStartDistanceInput.setAttribute('title', `Valor máximo: ${memberLengthMeters.toFixed(2)} metros`);
            console.log('Valor inicial de distancia establecido:', window.editStartDistanceInput.value, 'metros');
        } else {
            console.error('No se encontró el campo de entrada para la distancia inicial');
        }
        
        if (window.editEndDistanceInput) {
            // Convertir de proporción normalizada (0-1) a metros reales
            const endDistanceMeters = (load.endDistance !== undefined ? load.endDistance : 1) * memberLengthMeters;
            window.editEndDistanceInput.value = endDistanceMeters.toFixed(2);
            window.editEndDistanceInput.setAttribute('max', memberLengthMeters.toFixed(2));
            window.editEndDistanceInput.setAttribute('title', `Valor máximo: ${memberLengthMeters.toFixed(2)} metros`);
            console.log('Valor final de distancia establecido:', window.editEndDistanceInput.value, 'metros');
        } else {
            console.error('No se encontró el campo de entrada para la distancia final');
        }
        
        // Mostrar el modal usando la variable global
        if (window.editDistLoadModal) {
            window.editDistLoadModal.style.display = 'block';
        } else {
            console.error('No se encontró el modal de edición de carga distribuida');
        }
    }
    
    // Función para cerrar el modal de edición de carga distribuida
    function closeEditDistLoadModal() {
        if (window.editDistLoadModal) window.editDistLoadModal.style.display = 'none';
        window.currentEditingLoad = null; // Limpiar la referencia a la carga global
        console.log('Modal de edición de carga distribuida cerrado');
    }
    
    // Función para guardar los cambios en la carga distribuida
    function saveEditDistLoad() {
        if (!window.currentEditingLoad) {
            console.error('No hay carga seleccionada para editar');
            return;
        }
        
        try {
            console.log('Guardando cambios para carga:', window.currentEditingLoad.id);
            
            // Obtener y validar los valores directamente desde las variables globales
            let startLoadValue = 0;
            let endLoadValue = 0;
            let startDistanceValue = 0;
            let endDistanceValue = 1;
            
            // Verificar que existan los campos de entrada para cargas
            if (!window.editStartLoadInput || !window.editEndLoadInput) {
                console.error('No se pudieron encontrar los campos de entrada para cargas', {
                    startLoadInput: window.editStartLoadInput ? 'encontrado' : 'no encontrado',
                    endLoadInput: window.editEndLoadInput ? 'encontrado' : 'no encontrado'
                });
                alert('Error: No se encontraron los campos de entrada para editar la carga');
                return;
            }
            
            // Verificar que existan los campos de entrada para distancias
            if (!window.editStartDistanceInput || !window.editEndDistanceInput) {
                console.error('No se pudieron encontrar los campos de entrada para distancias', {
                    startDistanceInput: window.editStartDistanceInput ? 'encontrado' : 'no encontrado',
                    endDistanceInput: window.editEndDistanceInput ? 'encontrado' : 'no encontrado'
                });
                console.warn('Se usarán valores por defecto para las distancias');
            }
            
            // Obtener el valor inicial directamente de la variable global
            const startInputValue = window.editStartLoadInput.value;
            console.log('Valor inicial obtenido del campo global:', startInputValue);
            
            if (startInputValue !== '' && startInputValue !== null) {
                startLoadValue = parseFloat(startInputValue);
                if (isNaN(startLoadValue)) {
                    console.warn('Valor inicial no válido, usando valor original');
                    startLoadValue = window.currentEditingLoad.startValue || 0;
                }
            } else {
                console.warn('Campo inicial vacío, usando valor original');
                startLoadValue = window.currentEditingLoad.startValue || 0;
            }
            
            // Obtener el valor final directamente de la variable global
            const endInputValue = window.editEndLoadInput.value;
            console.log('Valor final obtenido del campo global:', endInputValue);
            
            if (endInputValue !== '' && endInputValue !== null) {
                endLoadValue = parseFloat(endInputValue);
                if (isNaN(endLoadValue)) {
                    console.warn('Valor final no válido, usando valor original');
                    endLoadValue = window.currentEditingLoad.endValue || 0;
                }
            } else {
                console.warn('Campo final vacío, usando valor original');
                endLoadValue = window.currentEditingLoad.endValue || 0;
            }
            
            // Obtener la longitud del miembro en metros si existe
            const memberLengthMeters = window.currentEditingMemberLength || 1.0;
            console.log('Usando longitud del miembro para normalizar distancias:', memberLengthMeters, 'metros');
            
            // Procesar los valores de distancia si los campos existen (como valores en metros)
            if (window.editStartDistanceInput) {
                const startDistanceInputValue = window.editStartDistanceInput.value;
                console.log('Valor inicial de distancia obtenido del campo global (metros):', startDistanceInputValue);
                
                // Parsear el valor en metros
                let startDistanceMeters = 0;
                if (startDistanceInputValue !== '' && startDistanceInputValue !== null) {
                    startDistanceMeters = parseFloat(startDistanceInputValue);
                    if (isNaN(startDistanceMeters)) {
                        console.warn('Valor inicial de distancia no válido, usando valor original');
                        // Si el valor original estaba en proporción, convertirlo a metros
                        startDistanceMeters = (window.currentEditingLoad.startDistance !== undefined ? 
                            window.currentEditingLoad.startDistance : 0) * memberLengthMeters;
                    }
                } else {
                    console.warn('Campo de distancia inicial vacío, usando valor original');
                    // Si el valor original estaba en proporción, convertirlo a metros
                    startDistanceMeters = (window.currentEditingLoad.startDistance !== undefined ? 
                        window.currentEditingLoad.startDistance : 0) * memberLengthMeters;
                }
                
                // Limitar al rango válido
                startDistanceMeters = Math.max(0, Math.min(memberLengthMeters, startDistanceMeters));
                
                // Convertir de metros a proporción normalizada (0-1)
                startDistanceValue = startDistanceMeters / memberLengthMeters;
                console.log('Distancia inicial normalizada:', startDistanceValue);
            }
            
            if (window.editEndDistanceInput) {
                const endDistanceInputValue = window.editEndDistanceInput.value;
                console.log('Valor final de distancia obtenido del campo global (metros):', endDistanceInputValue);
                
                // Parsear el valor en metros
                let endDistanceMeters = memberLengthMeters; // Por defecto al final del miembro
                if (endDistanceInputValue !== '' && endDistanceInputValue !== null) {
                    endDistanceMeters = parseFloat(endDistanceInputValue);
                    if (isNaN(endDistanceMeters)) {
                        console.warn('Valor final de distancia no válido, usando valor original');
                        // Si el valor original estaba en proporción, convertirlo a metros
                        endDistanceMeters = (window.currentEditingLoad.endDistance !== undefined ? 
                            window.currentEditingLoad.endDistance : 1) * memberLengthMeters;
                    }
                } else {
                    console.warn('Campo de distancia final vacío, usando valor original');
                    // Si el valor original estaba en proporción, convertirlo a metros
                    endDistanceMeters = (window.currentEditingLoad.endDistance !== undefined ? 
                        window.currentEditingLoad.endDistance : 1) * memberLengthMeters;
                }
                
                // Limitar al rango válido
                endDistanceMeters = Math.max(0, Math.min(memberLengthMeters, endDistanceMeters));
                
                // Convertir de metros a proporción normalizada (0-1)
                endDistanceValue = endDistanceMeters / memberLengthMeters;
                console.log('Distancia final normalizada:', endDistanceValue);
            }
            
            console.log('Valores a actualizar:', { 
                id: window.currentEditingLoad.id,
                startValue: startLoadValue, 
                endValue: endLoadValue,
                startDistance: startDistanceValue,
                endDistance: endDistanceValue,
                loadType: window.currentEditingLoad.loadType
            });
            
            // Actualizar la carga en el array global
            let cargaActualizada = false;
            for (let i = 0; i < window.loads.length; i++) {
                if (window.loads[i].id === window.currentEditingLoad.id) {
                    // Guardar valores anteriores para verificación
                    const oldStartValue = window.loads[i].startValue;
                    const oldEndValue = window.loads[i].endValue;
                    const oldStartDistance = window.loads[i].startDistance;
                    const oldEndDistance = window.loads[i].endDistance;
                    
                    // Actualizar valores de carga en el array global
                    window.loads[i].startValue = startLoadValue;
                    window.loads[i].endValue = endLoadValue;
                    
                    // Actualizar valores de distancia en el array global
                    window.loads[i].startDistance = startDistanceValue;
                    window.loads[i].endDistance = endDistanceValue;
                    
                    // Verificar que todos los valores se hayan actualizado
                    console.log('Valores actualizados correctamente:', {
                        // Valores de carga
                        startLoadBefore: oldStartValue,
                        startLoadAfter: window.loads[i].startValue,
                        endLoadBefore: oldEndValue,
                        endLoadAfter: window.loads[i].endValue,
                        // Valores de distancia
                        startDistanceBefore: oldStartDistance,
                        startDistanceAfter: window.loads[i].startDistance,
                        endDistanceBefore: oldEndDistance,
                        endDistanceAfter: window.loads[i].endDistance
                    });
                    
                    cargaActualizada = true;
                    break;
                }
            }
            
            if (!cargaActualizada) {
                console.error('No se encontró la carga en el array global');
                alert('Error: No se pudo actualizar la carga.');
                return;
            }
            
            // Cerrar el modal
            closeEditDistLoadModal();
            
            // Limpiar variables globales de dibujo
            if (window.linearXLineStarts) window.linearXLineStarts = [];
            if (window.linearXLineEnds) window.linearXLineEnds = [];
            
            // Limpiar el canvas y redibujar todo
            console.log('Redibujando el canvas...');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();
            
            // Asegurarse de redibujar todos los elementos
            drawLoads();
            
            console.log('Canvas actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar la carga distribuida:', error);
            alert('Ocurrió un error al actualizar la carga distribuida. Verifique la consola para más detalles.');
        }
    }
    
    // Event listeners para el modal de edición de carga distribuida
    if (closeEditDistLoadButton) {
        closeEditDistLoadButton.addEventListener('click', closeEditDistLoadModal);
    }
    
    if (cancelEditDistLoadButton) {
        cancelEditDistLoadButton.addEventListener('click', closeEditDistLoadModal);
    }
    
    if (saveEditDistLoadButton) {
        saveEditDistLoadButton.addEventListener('click', saveEditDistLoad);
    }
    
    // Verificar que el modal de carga distribuida esté correctamente configurado
    console.log('Modal de carga distribuida:', distributedLoadModal ? 'Encontrado' : 'No encontrado');
    console.log('Botones de tipo de carga:', loadTypeButtons.length);
    
    // Asegurar que el selector de carga perpendicular esté configurado correctamente
    const perpendicularLoadBtn = document.getElementById('perpendicularLoad');
    if (perpendicularLoadBtn) {
        console.log('Botón de carga perpendicular encontrado');
    }
    
    // Event listener para validar que la distancia no exceda la longitud del miembro
    if (loadDistanceInput) {
        loadDistanceInput.addEventListener('input', () => {
            // Obtener el valor máximo (longitud del miembro)
            const maxDistance = parseFloat(loadDistanceInput.max);
            // Obtener el valor actual introducido por el usuario
            let currentValue = parseFloat(loadDistanceInput.value);
            
            // Validar que el valor no sea mayor que el máximo
            if (currentValue > maxDistance) {
                // Si es mayor, establecerlo al valor máximo
                loadDistanceInput.value = maxDistance;
                console.log(`La distancia ha sido ajustada al máximo permitido (${maxDistance})`);
            }
            
            // Validar que el valor no sea menor que 0
            if (currentValue < 0) {
                loadDistanceInput.value = 0;
                console.log('La distancia no puede ser negativa');
            }
        });
    }
    
    // Event listener para actualizar el marcador de ángulo cuando cambia el valor
    if (loadAngleInput) {
        loadAngleInput.addEventListener('input', () => {
            const angle = parseInt(loadAngleInput.value) || 0;
            updateAngleMarker(angle);
        });
    }
    
    // Event listeners para el modal de carga puntual en el nodo
    const closePointLoadNodeButton = document.querySelector('.point-load-node-close-button');
    const cancelPointLoadNodeButton = document.getElementById('cancelPointLoadNode');
    const savePointLoadNodeButton = document.getElementById('savePointLoadNode');
    const nodeLoadMagnitudeInput = document.getElementById('nodeLoadMagnitude');
    const nodeLoadAngleInput = document.getElementById('nodeLoadAngle');
    const pointLoadNodeModal = document.getElementById('pointLoadNodeModal');
    
    if (closePointLoadNodeButton) {
        closePointLoadNodeButton.addEventListener('click', closePointLoadNodeModal);
    }
    
    if (cancelPointLoadNodeButton) {
        cancelPointLoadNodeButton.addEventListener('click', closePointLoadNodeModal);
    }
    
    if (savePointLoadNodeButton) {
        savePointLoadNodeButton.addEventListener('click', () => {
            // Lógica para guardar la carga puntual en el nodo
            const magnitude = parseFloat(nodeLoadMagnitudeInput.value) || 0;
            const angle = parseFloat(nodeLoadAngleInput.value) || 0;
            
            if (loadDrawState.selectedNodeId) {
                // Crear la carga puntual en el nodo
                const newLoad = {
                    id: Date.now(),
                    type: 'pointNode',
                    nodeId: loadDrawState.selectedNodeId,
                    magnitude: magnitude,
                    angle: angle
                };
                
                // Añadir la carga al array
                loads.push(newLoad);
                
                console.log(`Carga puntual creada en nodo con ID ${newLoad.nodeId} con magnitud ${magnitude} kN y ángulo ${angle}°`);
                
                // Cerrar el modal y resetear el estado
                closePointLoadNodeModal();
                resetLoadDrawState();
                
                // Redibujar para mostrar la carga
                updateCanvas();
            } else {
                console.error('No se ha seleccionado un nodo para la carga');
            }
        });
    }
    
    // Event listener para actualizar el marcador de ángulo del nodo cuando cambia el valor
    if (nodeLoadAngleInput) {
        nodeLoadAngleInput.addEventListener('input', () => {
            const angle = parseInt(nodeLoadAngleInput.value) || 0;
            updateNodeAngleMarker(angle);
        });
    }
    
    // Variables para el arrastre del marcador de ángulo del nodo
    let isDraggingNodeMarker = false;
    let nodeAngleCircle = document.querySelector('#pointLoadNodeModal .angle-circle');
    
    // Función para calcular el ángulo basado en la posición del mouse relativa al centro del círculo
    function calculateNodeAngleFromMousePosition(event) {
        if (!nodeAngleCircle) return 0;
        
        // Obtener las coordenadas del centro del círculo
        const rect = nodeAngleCircle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calcular la posición relativa del mouse al centro
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;
        
        // Calcular el ángulo en radianes y convertir a grados
        let angle = Math.atan2(-mouseY, mouseX) * (180 / Math.PI);
        
        // Asegurarse de que el ángulo esté entre 0 y 360 grados
        if (angle < 0) angle += 360;
        
        return Math.round(angle); // Redondear al entero más cercano
    }
    
    // Event listener para el clic en el marcador del nodo (bolita naranja)
    const nodeAngleMarker = document.getElementById('nodeAngleMarker');
    if (nodeAngleMarker) {
        nodeAngleMarker.addEventListener('mousedown', function(event) {
            // Activar el arrastre solo cuando se hace clic directamente en la bolita
            isDraggingNodeMarker = true;
            event.stopPropagation(); // Evitar que el evento llegue al círculo
        });
    }
    
    // Event listener para el movimiento del mouse cuando se está arrastrando el marcador del nodo
    document.addEventListener('mousemove', function(event) {
        // Solo mover si se está arrastrando la bolita del nodo
        if (isDraggingNodeMarker) {
            const angle = calculateNodeAngleFromMousePosition(event);
            nodeLoadAngleInput.value = angle;
            updateNodeAngleMarker(angle);
        }
    });
    
    // Event listener para detener el arrastre del marcador del nodo cuando se suelta el botón del mouse
    document.addEventListener('mouseup', function() {
        isDraggingNodeMarker = false;
    });
    
    // Variables para el arrastre del marcador de ángulo
    let isDraggingMarker = false;
    let angleCircle = document.querySelector('.angle-circle');
    
    // Función para calcular el ángulo basado en la posición del mouse relativa al centro del círculo
    function calculateAngleFromMousePosition(event) {
        if (!angleCircle) return 0;
        
        // Obtener las coordenadas del centro del círculo
        const rect = angleCircle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calcular la posición relativa del mouse al centro
        const mouseX = event.clientX - centerX;
        const mouseY = event.clientY - centerY;
        
        // Calcular el ángulo en radianes y convertir a grados
        let angle = Math.atan2(-mouseY, mouseX) * (180 / Math.PI);
        
        // Asegurarse de que el ángulo esté entre 0 y 360 grados
        if (angle < 0) angle += 360;
        
        return Math.round(angle); // Redondear al entero más cercano
    }
    
    // Event listener para el clic en el marcador (bolita naranja)
    const angleMarker = document.getElementById('angleMarker');
    if (angleMarker) {
        angleMarker.addEventListener('mousedown', function(event) {
            // Activar el arrastre solo cuando se hace clic directamente en la bolita
            isDraggingMarker = true;
            event.stopPropagation(); // Evitar que el evento llegue al círculo
        });
    }
    
    // Event listener para el movimiento del mouse cuando se está arrastrando
    document.addEventListener('mousemove', function(event) {
        // Solo mover si se está arrastrando la bolita
        if (isDraggingMarker) {
            const angle = calculateAngleFromMousePosition(event);
            loadAngleInput.value = angle;
            updateAngleMarker(angle);
        }
    });
    
    // Event listener para detener el arrastre cuando se suelta el botón del mouse
    document.addEventListener('mouseup', function() {
        isDraggingMarker = false;
    });
    
    // Event listener para guardar la carga puntual sobre la barra
    if (savePointLoadMemberButton) {
        savePointLoadMemberButton.addEventListener('click', () => {
            // Verificar que se haya seleccionado un miembro
            if (loadDrawState.selectedMemberId) {
                // Obtener los valores de los campos
                const distance = parseFloat(loadDistanceInput.value) || 0;
                const magnitude = parseFloat(loadMagnitudeInput.value) || 0;
                const angle = parseInt(loadAngleInput.value) || 0;
                
                // Crear la carga
                const newLoad = {
                    id: `load-${nextLoadId++}`,
                    type: 'pointMember',
                    memberId: loadDrawState.selectedMemberId,
                    distance: distance,
                    magnitude: magnitude,
                    angle: angle
                };
                
                // Añadir la carga al array
                loads.push(newLoad);
                
                console.log(`Carga puntual creada en miembro ${newLoad.memberId} con magnitud ${magnitude} kN y ángulo ${angle}°`);
                
                // Restablecer el estado
                resetLoadDrawState();
                
                // Cerrar el modal
                closePointLoadMemberModal();
                
                // Redibujar para mostrar la carga
                updateCanvas();
            } else {
                console.error('No se ha seleccionado un miembro para la carga');
            }
        });
    }
    
    // Close modals with Escape key and deactivate modes
    // Función para activar/desactivar el modo de añadir nodos
    function toggleAddNodesMode() {
        isAddingNodeMode = !isAddingNodeMode; // Toggle the mode

        if (isAddingNodeMode) { // Si el modo "Add Node" ahora está ACTIVADO
            addNodeButton.classList.add('active');
            canvas.style.cursor = 'crosshair';

            // Desactivar el modo de miembro si está activo
            if (memberPropertiesModal.style.display === 'block') {
                memberPropertiesModal.style.display = 'none';
                resetMemberDrawState(); 
            }
            
            // Desactivar el modo de carga si está activo
            if (loadDrawState.active) {
                resetLoadDrawState();
            }
        } else { // Si el modo "Add Node" ahora está DESACTIVADO
            addNodeButton.classList.remove('active');
            // Si el modo de miembro también está desactivado, el cursor debe ser 'grab'.
            if (!memberDrawState.active && !loadDrawState.active) { 
                canvas.style.cursor = 'grab';
            }
        }
    }
    
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            // Desactivar todos los modos y botones
            if (isAddingNodeMode) {
                isAddingNodeMode = false; // Desactivar directamente, no alternar
                addNodeButton.classList.remove('active');
                if (!memberDrawState.active && !loadDrawState.active) {
                    canvas.style.cursor = 'grab';
                }
            }
            
            if (memberDrawState.active) {
                resetMemberDrawState(); // Deactivate member drawing mode
            }
            
            if (loadDrawState.active) {
                resetLoadDrawState(); // Desactivar el modo de añadir cargas
            }
            
            // Quitar clase 'active' de todos los botones de la barra de herramientas
            document.querySelectorAll('.toolbar button').forEach(button => {
                button.classList.remove('active');
            });
            
            // Cerrar modales si están abiertos
            if (memberPropertiesModal.style.display === 'block') {
                memberPropertiesModal.style.display = 'none';
            }
            if (nodeEditorModal.style.display === 'block') {
                nodeEditorModal.style.display = 'none';
            }
            if (memberEditorModal.style.display === 'block') {
                memberEditorModal.style.display = 'none';
            }
            if (sectionPropsModal.style.display === 'block') {
                sectionPropsModal.style.display = 'none';
            }
            if (editSectionModal.style.display === 'block') {
                editSectionModal.style.display = 'none';
            }
            if (loadTypeModal.style.display === 'block') {
                loadTypeModal.style.display = 'none';
            }
            if (pointLoadMemberModal.style.display === 'block') {
                pointLoadMemberModal.style.display = 'none';
            }
            if (assignSectionModal.style.display === 'block') {
                assignSectionModal.style.display = 'none';
            }
            
            // Deseleccionar cualquier miembro seleccionado
            if (selectedMemberId !== null) {
                selectedMemberId = null;
                updateMemberActionButtonsVisibility();
                updateCanvas();
            }
        }
    });
    
    // Event Listeners para el botón de añadir rótula
    if (addHingeButton) {
        addHingeButton.addEventListener('click', () => {
            // Verificar si hay un nodo seleccionado
            if (selectedNodeId !== null) {
                const nodeIndex = nodes.findIndex(node => node.id === selectedNodeId);
                if (nodeIndex > -1) {
                    // Cambiar el estado de la rótula del nodo seleccionado
                    nodes[nodeIndex].hasHinge = !nodes[nodeIndex].hasHinge;
                    
                    // Mostrar un mensaje en la consola
                    if (nodes[nodeIndex].hasHinge) {
                        console.log(`Rótula añadida al nodo ${nodes[nodeIndex].label || nodes[nodeIndex].id}`);
                    } else {
                        console.log(`Rótula eliminada del nodo ${nodes[nodeIndex].label || nodes[nodeIndex].id}`);
                    }
                    
                    // Cerrar el modal
                    memberPropertiesModal.style.display = 'none';
                    
                    // Redibujar el canvas para mostrar la rótula
                    updateCanvas();
                } else {
                    console.error('Error: Nodo seleccionado no encontrado para añadir rótula.');
                }
            } else {
                alert('Debe seleccionar un nodo primero para añadir una rótula.');
            }
        });
    }
    
    // Event Listeners para los botones de acción de miembros
    if (assignSectionButton) {
        assignSectionButton.addEventListener('click', openAssignSectionModal);
    }
    
    if (assignSectionCloseButton) {
        assignSectionCloseButton.addEventListener('click', closeAssignSectionModal);
    }
    
    if (cancelAssignSectionButton) {
        cancelAssignSectionButton.addEventListener('click', closeAssignSectionModal);
    }
    
    if (confirmAssignSectionButton) {
        confirmAssignSectionButton.addEventListener('click', () => {
            if (selectedMemberId === null) {
                console.error("Error: No hay miembro seleccionado para asignar sección.");
                closeAssignSectionModal();
                return;
            }
            
            const selectedSectionId = availableSectionsDropdown.value;
            if (!selectedSectionId) {
                console.warn("No se seleccionó ninguna sección.");
                return;
            }
            
            const memberIndex = members.findIndex(member => member.id === selectedMemberId);
            if (memberIndex > -1) {
                // Guardar el ID de la sección y el nombre para referencia
                members[memberIndex].sectionId = selectedSectionId;
                members[memberIndex].sectionName = sectionPropertiesData[selectedSectionId].name;
                
                // Guardar la etiqueta original si es la primera vez que se asigna una sección
                if (!members[memberIndex].originalLabel) {
                    members[memberIndex].originalLabel = members[memberIndex].label;
                }
                
                // Actualizar la etiqueta para mostrar nombre de la barra + tipo de sección
                members[memberIndex].label = `${members[memberIndex].originalLabel} [${sectionPropertiesData[selectedSectionId].name}]`;
                
                console.log(`Sección '${sectionPropertiesData[selectedSectionId].name}' asignada al miembro ${members[memberIndex].originalLabel}.`);
                updateCanvas(); // Redibujar para reflejar posibles cambios visuales
            } else {
                console.error("Error: Miembro seleccionado no encontrado para asignar sección.");
            }
            
            closeAssignSectionModal();
        });
    }
    
    if (deleteMemberButton) {
        deleteMemberButton.addEventListener('click', () => {
            // Eliminar miembro seleccionado
            if (selectedMemberId !== null) {
                const memberIndex = members.findIndex(member => member.id === selectedMemberId);
                if (memberIndex > -1) {
                    const deletedMember = members.splice(memberIndex, 1)[0];
                    console.log(`Miembro ${deletedMember.label} eliminado.`);
                    
                    // Eliminar todas las cargas asociadas a este miembro
                    let cargsEliminadas = 0;
                    if (typeof window.loads !== 'undefined' && Array.isArray(window.loads)) {
                        const initialLength = window.loads.length;
                        window.loads = window.loads.filter(load => load.memberId !== selectedMemberId);
                        cargsEliminadas = initialLength - window.loads.length;
                        if (cargsEliminadas > 0) {
                            console.log(`${cargsEliminadas} carga(s) eliminada(s) asociada(s) al miembro ${deletedMember.label}.`);
                        }
                    }
                    
                    selectedMemberId = null;
                    updateMemberActionButtonsVisibility();
                    updateCanvas();
                } else {
                    console.error('ID de miembro seleccionado no encontrado para eliminación.');
                    selectedMemberId = null;
                }
            }
            // Eliminar carga distribuida seleccionada
            else if (selectedLoadId !== null) {
                const loadIndex = window.loads.findIndex(load => load.id === selectedLoadId);
                if (loadIndex > -1) {
                    const deletedLoad = window.loads.splice(loadIndex, 1)[0];
                    console.log(`Carga distribuida ${deletedLoad.id} eliminada.`);
                    selectedLoadId = null;
                    updateMemberActionButtonsVisibility();
                    updateCanvas();
                } else {
                    console.error('ID de carga seleccionada no encontrado para eliminación.');
                    selectedLoadId = null;
                }
            }
            // Eliminar nodo seleccionado
            else if (selectedNodeId !== null) {
                // Verificar si el nodo está siendo usado por algún miembro
                const connectedMembers = members.filter(member => 
                    member.startNodeId === selectedNodeId || member.endNodeId === selectedNodeId
                );
                
                // Eliminar primero todas las barras conectadas y sus cargas asociadas
                if (connectedMembers.length > 0) {
                    // Guardar IDs de miembros conectados para eliminarlos
                    const connectedMemberIds = connectedMembers.map(member => member.id);
                    
                    // Eliminar cada miembro conectado y sus cargas asociadas
                    connectedMemberIds.forEach(memberId => {
                        const memberIndex = members.findIndex(member => member.id === memberId);
                        if (memberIndex > -1) {
                            const deletedMember = members.splice(memberIndex, 1)[0];
                            console.log(`Miembro ${deletedMember.label} eliminado automáticamente.`);
                            
                            // Eliminar todas las cargas asociadas a este miembro
                            if (typeof window.loads !== 'undefined' && Array.isArray(window.loads)) {
                                const initialLength = window.loads.length;
                                window.loads = window.loads.filter(load => load.memberId !== memberId);
                                const cargasEliminadas = initialLength - window.loads.length;
                                if (cargasEliminadas > 0) {
                                    console.log(`${cargasEliminadas} carga(s) eliminada(s) asociada(s) al miembro ${deletedMember.label}.`);
                                }
                            }
                        }
                    });
                }
                
                // Ahora eliminar el nodo
                const nodeIndex = nodes.findIndex(node => node.id === selectedNodeId);
                if (nodeIndex > -1) {
                    const deletedNode = nodes.splice(nodeIndex, 1)[0];
                    console.log(`Nodo ${deletedNode.label || deletedNode.id} eliminado.`);
                    
                    // Eliminar las cargas puntuales que pudieran estar asociadas directamente al nodo
                    if (typeof window.loads !== 'undefined' && Array.isArray(window.loads)) {
                        const initialLength = window.loads.length;
                        window.loads = window.loads.filter(load => !(load.type === 'pointNode' && load.nodeId === selectedNodeId));
                        const cargasEliminadas = initialLength - window.loads.length;
                        if (cargasEliminadas > 0) {
                            console.log(`${cargasEliminadas} carga(s) puntual(es) eliminada(s) asociada(s) al nodo ${deletedNode.label || deletedNode.id}.`);
                        }
                    }
                    
                    selectedNodeId = null;
                    updateMemberActionButtonsVisibility();
                    updateCanvas();
                } else {
                    console.error('ID de nodo seleccionado no encontrado para eliminación.');
                    selectedNodeId = null;
                }
            }
            // No hay nada seleccionado
            else {
                console.warn('Botón de eliminar pulsado pero no hay nada seleccionado.');
            }
            
            updateMemberActionButtonsVisibility();
        });
    }
    
    // Función para actualizar el canvas completo
    function updateCanvas() {
        drawGrid();
        drawLoads();
    }
    
    // Función para dibujar todas las cargas en el canvas
    function drawLoads() {
        console.log('Dibujando cargas. Total:', loads ? loads.length : 0);
        
        // Dibujar cargas puntuales
        drawPointLoads();
        
        // Dibujar cargas distribuidas
        drawDistributedLoads();
    }
    
    // Función para dibujar las cargas distribuidas
    function drawDistributedLoads() {
        console.log('Función drawDistributedLoads llamada');
        
        // Verificar que loads esté definido correctamente como variable global
        if (typeof window.loads === 'undefined') {
            console.warn('Array global de cargas no inicializado. Inicializando...');
            window.loads = [];
            return;
        }
        
        console.log('Cargas a dibujar desde variable global:', window.loads);
        let distributedLoadsCount = 0;
        
        // Recorrer todas las cargas desde la variable global
        window.loads.forEach(load => {
            if (load && load.type === 'distributed') {
                distributedLoadsCount++;
                console.log('Dibujando carga distribuida:', load);
                
                // Usar la nueva función de dibujo individual
                drawSingleDistributedLoad(load);
            }
        });
        
        console.log('Total de cargas distribuidas dibujadas:', distributedLoadsCount);
    }
    
    // Resize canvas when window resizes
    function resizeCanvas() {
        console.log('script.js: resizeCanvas() called');
        canvasWidth = canvas.offsetWidth;
        canvasHeight = canvas.offsetHeight;
        console.log(`script.js: Canvas dimensions - Width: ${canvasWidth}, Height: ${canvasHeight}`);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        updateCanvas();
    }

    // Initial setup
    console.log('script.js: Initializing event listeners and calling resizeCanvas()');
    // canvas.addEventListener('mousedown', handlePanMouseDown); // Now handled by general mousedown
    canvas.addEventListener('mousemove', handlePanMouseMove);
    canvas.addEventListener('mouseup', handlePanMouseUp);
    canvas.addEventListener('mouseout', handlePanMouseOut);
    window.addEventListener('resize', resizeCanvas);

    canvas.style.cursor = 'grab';
    resizeCanvas(); // Initial draw

    console.log('script.js: End of DOMContentLoaded');
});
